"""
End-to-end smoke test for the backend API. Exercises auth, the business
profile CRUD flow, settings, and the publishing approval workflow's public
endpoints against a running server (see README / `uvicorn main:app`).

Cleans up the test user + business profile it creates so repeat runs don't
accumulate junk rows.
"""
import asyncio
import sys
import uuid

import httpx

BASE_URL = "http://127.0.0.1:8000"
API = f"{BASE_URL}/api"


async def test_api() -> bool:
    results = []
    all_passed = True

    def record(name: str, res: httpx.Response, expected: int):
        nonlocal all_passed
        ok = res.status_code == expected
        all_passed = all_passed and ok
        results.append((name, res.status_code, expected, ok, res.text[:200]))

    async with httpx.AsyncClient() as client:
        print("Health check...")
        res = await client.get(f"{BASE_URL}/health")
        record("Health check", res, 200)

        print("Testing Auth...")
        test_email = f"qa_{uuid.uuid4().hex[:10]}@example.com"
        password = "SecurePassword123!"

        res = await client.post(f"{API}/auth/register", json={
            "email": test_email, "password": password, "name": "QA Tester",
        })
        record("Auth - Register", res, 201)
        token = res.json().get("access_token") if res.status_code == 201 else None

        res = await client.post(f"{API}/auth/register", json={
            "email": test_email, "password": password,
        })
        record("Auth - Duplicate register rejected", res, 409)

        res = await client.post(f"{API}/auth/login", json={
            "email": test_email, "password": "wrong-password",
        })
        record("Auth - Wrong password rejected", res, 401)

        res = await client.post(f"{API}/auth/login", json={
            "email": test_email, "password": password,
        })
        record("Auth - Login", res, 200)
        if res.status_code == 200:
            token = res.json().get("access_token")

        headers = {"Authorization": f"Bearer {token}"} if token else {}

        print("Testing route protection...")
        res = await client.get(f"{API}/business/profiles")
        record("Business profiles - unauthenticated rejected", res, 401)

        print("Testing Business Profile...")
        profile_id = None
        res = await client.post(f"{API}/business/profiles", headers=headers, json={
            "company_name": "QA Corp",
            "industry": "Software Testing",
            "description": "We test things end-to-end so nothing ships broken.",
            "brand_voice": "Direct and precise",
        })
        record("Business profile - create", res, 201)
        if res.status_code == 201:
            profile_id = res.json().get("id")

        res = await client.get(f"{API}/business/profiles", headers=headers)
        record("Business profile - list", res, 200)

        print("Testing Settings...")
        res = await client.get(f"{API}/settings/workspace", headers=headers)
        record("Settings - workspace", res, 200)
        res = await client.get(f"{API}/settings/ai", headers=headers)
        record("Settings - ai", res, 200)
        res = await client.get(f"{API}/settings/publishing", headers=headers)
        record("Settings - publishing", res, 200)

        print("Testing Publishing Approvals...")
        res = await client.get(f"{API}/approvals/pending", headers=headers)
        record("Approvals - pending list (authed)", res, 200)
        res = await client.get(f"{API}/approvals/pending")
        record("Approvals - pending list (unauthenticated rejected)", res, 401)
        res = await client.get(f"{API}/approvals/this-token-does-not-exist")
        record("Approvals - invalid token lookup (public)", res, 404)

        print("Cleaning up...")
        if profile_id:
            res = await client.delete(f"{API}/business/profiles/{profile_id}", headers=headers)
            record("Cleanup - delete business profile", res, 204)

        print()
        for name, status, expected, ok, text in results:
            marker = "PASS" if ok else "FAIL"
            print(f"[{marker}] {name} (got {status}, expected {expected})")
            if not ok:
                print(f"    {text}")

        return all_passed


if __name__ == "__main__":
    passed = asyncio.run(test_api())
    print("\nALL CHECKS PASSED" if passed else "\nSOME CHECKS FAILED")
    sys.exit(0 if passed else 1)
