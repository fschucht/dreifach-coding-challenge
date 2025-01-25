# Coding Challenge

https://github.com/user-attachments/assets/a20689f4-9d39-45da-9880-870bbae75785

## Getting Started

### Prerequisites

The following tools are required to run the project:
- [Docker](https://docs.docker.com/engine/install/) & [Docker Compose](https://docs.docker.com/compose/install/): Used for running the applications in production mode.
- [Mise](https://mise.jdx.dev/getting-started.html): Used for providing dev tooling and running the production locally.

### Development

1. Run `mise install`, followed by `mise reshim` to ensure you have the required version of `node`, `pnpm`, and `lefthook` installed. 
2. Install dependencies: `pnpm install`
3. Ensure you have redis running: `docker-compose up redis -d`.
4. Duplicate `.env.example` and rename to `.env`: `cp .env.example .env`.
5. Update the values in `.env`.
6. Run `pnpm run start:api:dev` and `pnpm run start:worker:dev` to start the `api` and `worker` applications.
7. The email parsing endpoint is accessible at `POST http://localhost:3000/api/v1/emails/parse`.

### Production

1. Start the application using docker-compose: `docker-compose up`.
2. Duplicate `.env.example` and rename to `.env`: `cp .env.example .env`.
3. Update the values in `.env`.
4. The email parsing endpoint is accessible at `POST http://localhost:3000/api/v1/emails/parse`.

## Project Structure

The project follows a domain-driven approach with the following folder structure:
- `api`: Contains the public endpoints through which the applications can be accessed. Currently, these use HTTP, but could use other transports, such as GRPC or Websockets in the future.
- `apps`: Contains the entrypoints for each application, currently `api`, the email parsing microservice, and `worker`, the application handling incoming events.
- `config`: Contains any configurations, split by their app, domain, or infra modules.
- `domain`: Contains domain-specific logic in isolated modules.
- `infra`: Contains infrastructure-specific logic in isolated modules.

## Challenge Description

### Task

At dreifach.ai we work a lot with industry insurance brokers for small and medium-sized enterprises. A typical problem these brokers face is that they receive many emails that have to be manually processed by the back office team. This is a tedious, boring task that takes up a lot of time and is prone to errors.

Your task is to write a http microservice that receives emails via POST request, classifies the email purpose & insurance type, extracts relevant data from the email, and then sends the extracted data to a message queue (to the topic corresponding to the email purpose). 

The purpose of the email can be one of the following:

* New Policy Request
* Policy Renewal
* Policy Modification
* Quote Request
* Information Request

The insurance type can be one of the following:

* Transport Insurance (for Logistics)
* Product Liability Insurance (for Automotive)
* Environmental Liability Insurance (for Chemical)

The data to be extracted from the email is the following:

1. Company Name
2. Contact Person
3. Insured Item/Activity
4. Value of Insured Item (when mentioned)
5. Number of Employees to be Covered (if applicable)
6. Desired Start Date of Coverage
7. Origin and Destination (for Transport Insurance)

The microservice should be able to handle ambiguous cases and temporal context.

To test your service, we have generated synthetic emails that you can use for development. You can find them in the `data` folder.

**Bonus points:**
* Give a confidence score for the classification.


### Instructions

You can use the programming language you are most comfortable with, though we recommend using TypeScript.
For the message queue you can use any message queue you like, though we recommend using RabbitMQ or Redis.

You can push directly to the main branch of this repository.
