# Hybrid swap for the Canton Network (HSCN)

> **Hybrid swap for the Canton Network** — A DAML & Canton-based application for secure, privacy-preserving cross-party asset swaps.

---

## Table of contents

1. [Project overview](#project-overview)
2. [Problem statement](#problem-statement)
3. [Goals & features](#goals--features)
4. [Architecture](#architecture)
5. [Prerequisites](#prerequisites)
6. [Local setup & development](#local-setup--development)

   * [Folder layout](#folder-layout)
   * [Build & run the ledger and JSON API](#build--run-the-ledger-and-json-api)
7. [Docker (containerized) setup](#docker-containerized-setup)
8. [Deployments (examples)](#deployments-examples)

   * [Fly.io (recommended free/no-card option)](#flyio-recommended-freeno-card-option)
   * [Railway (alternative)](#railway-alternative)
   * [AWS EC2 / Elastic Beanstalk (production-ready)](#aws-ec2--elastic-beanstalk-production-ready)
9. [Configuration / Environment variables](#configuration--environment-variables)
10. [Persistent storage & package stability](#persistent-storage--package-stability)
11. [Testing & API examples](#testing--api-examples)
12. [Troubleshooting & tips](#troubleshooting--tips)
13. [CI / CD example (GitHub Actions)](#ci--cd-example-github-actions)
14. [Contributing](#contributing)
15. [License and acknowledgements](#license-and-acknowledgements)

---

## Project overview

**Hybrid swap for the Canton Network** is a reference implementation that demonstrates how to build a privacy-preserving, multi-party asset swap application using the DAML smart-contract language and the Canton network (participant/partitioned ledger). The project runs a DAML Sandbox/Canton participant, the DAML JSON API, and an optional frontend that interacts with the JSON API.

This repository contains the DAML model (DAR), any Canton configuration files, helper scripts, and Docker / deployment manifests so the app can be run locally for development and deployed to cloud hosting providers.

---

## Problem statement

Cross-organization asset transfers often require a trusted intermediary or expose sensitive business logic and data. Enterprises need a way to perform atomic swaps or coordinated multi-party workflows while preserving data sovereignty, privacy, and compliance. Existing single-tenant or public ledgers either force exposure of data or require heavy integration effort to coordinate transactions across different administrative domains.

**Hybrid swap for the Canton Network** solves this by:

* Enabling **multi-party asset swaps** with deterministic, auditable contracts (DAML templates).
* Using **Canton** to provide **multi-party, partitioned ledger instances** where participants can control their own data and still participate in cross-domain protocols.
* Providing a JSON API to integrate with web frontends or backend services.

---

## Goals & features

* Demonstrate a clean, auditable DAML contract design for atomic swaps.
* Show how to run a Canton participant with persistent storage.
* Provide a JSON API and sample client interactions (create / query / exercise choices).
* Containerized deployment for portability (Docker, Fly.io, Railway, AWS).
* Tools and scripts for local development, testing, and debugging.

---

## Architecture

**Components**

* **DAML model (DAR)**: Domain model and contract templates that express the swap logic and required choices.
* **Canton / DAML Sandbox**: The ledger engine (Canton in production-like mode or DAML Sandbox for local dev).
* **DAML JSON API**: Exposes REST endpoints for interacting with the ledger (`/v1/create`, `/v1/query`, `/v1/exercise`, etc.).
* **Frontend / Client** (optional): A web UI or scripts that call the JSON API.
* **Persistence**: Optional persistent volume for Canton ledger data so package IDs and ledger state survive restarts.

**How data flows**

1. A client (UI or script) calls the JSON API to create a contract or exercise a choice.
2. JSON API sends the request to the Canton participant (ledger) which processes the transaction.
3. The ledger returns transaction results and events are visible through the JSON API queries.

---

## Prerequisites

Install the following on your development machine:

* **DAML SDK** (version compatible with the project). See DAML install docs for the exact installer.
* **Java 17+** (JDK) — required by DAML/Canton components.
* **Docker** (for containerized builds and local container testing).
* **Git** (to clone repository).
* Optional tools depending on chosen host: **flyctl** (Fly.io CLI), **railway CLI**, **AWS CLI / EB CLI**.

Minimum recommended machine: 4GB RAM for comfortable local dev; JVM ledger components may require more.

---

## Local setup & development

### Folder layout (example)

```
/ (repo root)
├─ daml/                  # DAML project
│  ├─ daml.yaml
│  └─ src/                # DAML templates & tests
├─ canton/                # canton.conf, ledger configs
├─ json-api/              # JSON API config wrappers (if any)
├─ frontend/              # optional web UI
├─ Dockerfile
├─ fly.toml               # optional for Fly.io
└─ README.md
```

### Build & run the ledger and JSON API (local)

1. **Build the DAML project**

```bash
# from repo root or daml/ directory
daml build
```

The build will produce a `.dar` file under `daml/dist` (or `daml/.daml/dist`). Keep note of the DAR path.

2. **Start Canton / DAML sandbox and JSON API**

If you are using the DAML assistant and sandbox for local dev:

```bash
# start sandbox and JSON API in one command (example)
daml start --sandbox-option --port 7600 --json-api-port 7500
```

Alternatively, if you have a custom Canton config or want to run JSON API separately:

```bash
# run Canton sandbox/participant (example placeholder, adjust to your config)
daml sandbox --port 7600 path/to/your.dar

# run JSON API pointing to the ledger
daml json-api --ledger-host localhost --ledger-port 7600 --http-port 7500 --ledger-id "HybridSwapLedger"
```

3. **Run the frontend** (if present)

```bash
cd frontend
npm install
npm start
# or yarn start
```

4. **Check the JSON API**

```bash
curl http://localhost:7500/v1/query
```

You should receive a JSON response (likely an empty result set) or the API description.

---

## Docker (containerized) setup

A recommended Dockerfile (adjust DAML SDK version as needed):

```dockerfile
FROM digitalasset/daml-sdk:3.4.8

WORKDIR /app

# Copy project files into container
COPY . .

# Build the DAR inside the image so the container is self-contained
RUN daml build

# Expose the DAML JSON API port (change if needed)
EXPOSE 7500 7600

# Default command to start Canton / sandbox + JSON API
CMD ["sh", "-lc", "daml start --sandbox-option --port 7600 --json-api-port 7500"]
```

Build and test your image locally:

```bash
docker build -t hybrid-swap-canton .

docker run --rm -p 7500:7500 -p 7600:7600 hybrid-swap-canton
```

This will allow you to interact with `http://localhost:7500` just as in local development.

---

## Deployments (examples)

### Fly.io (recommended free/no-card option)

1. Install `flyctl` and login: `fly auth login`.
2. Initialize app: `fly launch` (pick a name and region; say NO when asked to deploy immediately).
3. Edit `fly.toml` so the public port maps to the JSON API internal port (example):

```toml
[[services]]
  internal_port = 7500
  protocol = "tcp"

  [[services.ports]]
    port = 8080
```

This exposes Fly's `https://your-app.fly.dev` on port 8080 while the container listens on 7500. Adjust if you want direct 80/443 mapping.

4. Create a persistent volume (recommended if you want ledger persistence):

```bash
fly volumes create canton-data --size 1
```

5. Add a mount to `fly.toml` (to `/data` for example) and configure Canton to use `/data` for ledger storage.

6. Deploy:

```bash
fly deploy
```

7. The app will be available at `https://<app-name>.fly.dev` with TLS automatically provisioned.

### Railway (alternative)

Railway can build from a Dockerfile or from your repo. For Docker deployments, push the Dockerfile and:

* Create project on Railway and link to the repo.
* Choose Dockerfile-based deployment and set environment variables.

Railway maps a dynamic port via the `PORT` env var. You can update your container command to read `JSON_API_PORT=$PORT` so the JSON API listens on the provided port.

### AWS EC2 / Elastic Beanstalk (production-ready)

* **EC2**: Launch a t3.micro/t2.micro (free-tier requires card on signup) instance, install Java, DAML, and run `daml start`. Use an EBS volume for ledger persistence and open ports in the security group for JSON API/Canton (or proxy through nginx).

* **Elastic Beanstalk**: Use a Docker platform and push the same Dockerfile. EB will handle load balancing and provisioning. For data persistence use EBS or attach RDS/S3 depending on your needs.

---

## Configuration / Environment variables

Common environment variables used by this project or JSON API:

* `JSON_API_PORT` — port the DAML JSON API listens on (default: 7500).
* `CANTON_PORT` — port for the Canton participant (default: 7600).
* `LEDGER_ID` — optional custom ledger id used by the JSON API.
* `CANTON_CONFIG_PATH` — path to a canton.conf file inside the container.
* `DAML_DAR_PATH` — path to the DAR file if you prefer to pass it dynamically.

Set these variables in your deployment environment (Fly/railway/EC2) as needed.

---

## Persistent storage & package stability

* By default, DAML Sandbox and simple Canton setups may be **ephemeral**: package IDs will change when the ledger restarts and data will be lost.
* For any real testing or production usage, **attach persistent storage** to the ledger participant so that:

  * The DARs/packages are uploaded once and package IDs remain stable.
  * Ledger state and transactions survive restarts.

**Fly volumes** (or EBS on AWS) are recommended for Canton persistence. Configure Canton to use the mounted directory for ledger data and snapshots.

---

## Testing & API examples

Example **create** request (JSON API):

```bash
curl -X POST http://localhost:7500/v1/create \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "MainModule:SwapContract",
    "payload": {
      "partyA": "PartyA",
      "partyB": "PartyB",
      "assetA": { "amount": 100 },
      "assetB": { "token": "XYZ", "amount": 50 }
    }
  }'
```

Example **query** request:

```bash
curl http://localhost:7500/v1/query
```

Example **exercise** (choice) request:

```bash
curl -X POST http://localhost:7500/v1/exercise \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "MainModule:SwapContract",
    "choice": "AcceptSwap",
    "contractId": "<contract-id>",
    "argument": { }
  }'
```

Replace `MainModule:SwapContract` and other payload fields with the actual names from your DAML code.

---

## Troubleshooting & tips

* **Package ID changes on restart**: Use persistent storage; upload your DAR to the ledger once and reuse the ledger. Avoid hard-coding package IDs—refer to templates by module and name when possible.
* **Out-of-memory / high memory usage**: Canton and DAML JSON API are JVM-based. If your host has <1GB RAM, consider smaller sandbox options, optimize JVM flags, or use a beefier host.
* **Ports not accessible**: Ensure your host (Fly, Railway, EC2) maps the internal container ports to public ports and that firewalls/security groups allow traffic.
* **JSON API 404s**: Check that the JSON API has successfully connected to the ledger (logs will show the connection status). Use `daml ledger`/`daml json-api` logs for debugging.
* **File permissions on mounted volumes**: Ensure the ledger process can read/write the mounted directory.

Logs are your friend: `fly logs`, `docker logs`, or `journalctl` on VM instances will help trace issues.

---

## CI / CD example (GitHub Actions)

A minimal GitHub Action to build and push to Fly.io on `main` branch (example):

```yaml
name: Deploy to Fly
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install flyctl
        run: curl -L https://fly.io/install.sh | sh
      - name: Deploy
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: |
          fly deploy --config fly.toml --remote-only
```

Store `FLY_API_TOKEN` in your repository secrets.

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-feature`.
3. Add tests and update DAML models if needed.
4. Submit a pull request with a clear description.

Please keep commits focused and document public interface changes to DAML templates and choices.

---

## License and acknowledgements

This project is provided as an example/reference and is licensed under the MIT License (or choose your preferred open-source license). Acknowledge DAML and Digital Asset, Canton, and any libraries used in this project.

---

## Contact

If you need help or want me to add deployment scripts for a specific provider (Fly.io, Railway, or AWS), CI templates, or a sample frontend that interacts with the JSON API, say the word and I will add them.
