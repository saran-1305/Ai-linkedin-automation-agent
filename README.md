# LinkedIn Growth Agent

This repository contains the foundational enterprise architecture for the LinkedIn Growth Agent, a scalable AI platform. Currently, **Module 1: Business Understanding Agent** is implemented.

## Architecture
The system is built using Clean Architecture and SOLID principles.

### Frontend
- **Tech Stack**: React (Vite), TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod.
- **Design System**: Premium AI SaaS Dashboard aesthetic (dark mode, specific color palette, Inter font).
- **Structure**:
  - `/components/ui`: Generic reusable UI components.
  - `/features`: Scalable feature folders.
  - `/services/api`: Typed Axios API client.
  - `/types`: Strict TypeScript interfaces.

### Backend
- **Tech Stack**: FastAPI, Python, PostgreSQL, SQLAlchemy, Alembic, Pydantic.
- **Data Flow**: `API Routes -> Service Layer -> Agent Logic -> Repository Layer -> Database`
- **Structure**:
  - `/api`: FastAPI routes and dependencies.
  - `/services`: Business logic orchestration.
  - `/repositories`: Database abstraction layer.
  - `/agents/business_understanding`: AI Agent pipeline (Validator, Normalizer, Processor).
  - `/core/ai`: (Placeholder) Foundation for LLM integrations, vector stores, memory.
  - `/orchestrator`: (Placeholder) Master Orchestrator for inter-agent communication.

## Future Modules
Placeholders have been created for future agents in the `backend/agents/` directory (e.g., `HistoricalAnalysisAgent`, `ContentGeneratorAgent`). These agents will communicate strictly through the Master Orchestrator.

## Getting Started

### Prerequisites
- Node.js (v20 or higher recommended)
- Python 3.11+
- PostgreSQL server running locally

### Running the Application Locally

#### 1. Database Setup
Ensure your local PostgreSQL server is running. Create a database named `linkedin_growth`.
Copy `.env.example` to `.env` and configure your local database credentials if they differ from the defaults.

#### 2. Backend (FastAPI)
Navigate to the backend directory, create a virtual environment, install dependencies, and run the server:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The backend API will be available at `http://localhost:8000`.

#### 3. Frontend (React)
In a new terminal window, navigate to the frontend directory, install dependencies, and run the dev server:
```bash
cd frontend
npm install
npm run dev
```
The frontend UI will be available at `http://localhost:5173`.

### API Endpoints (Module 1)
- `POST /api/business/profile`: Create a new business profile.
- `GET /api/business/profile/{id}`: Fetch a profile.
- `PUT /api/business/profile/{id}`: Update a profile.
- `DELETE /api/business/profile/{id}`: Delete a profile.
- `GET /health`: System health check.
