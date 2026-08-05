from models.publishing import PlatformAccount
from publishing.providers.base import BaseProvider
from publishing.providers.linkedin import LinkedInProvider
from publishing.providers.twitter import TwitterProvider

class ProviderFactory:
    @staticmethod
    def get_provider(account: PlatformAccount) -> BaseProvider:
        platform = account.platform_name.lower()
        if platform == "linkedin":
            return LinkedInProvider(account)
        elif platform in ["twitter", "x"]:
            return TwitterProvider(account)
        else:
            # Fallback to LinkedIn for mocking unknown platforms in testing
            return LinkedInProvider(account)
