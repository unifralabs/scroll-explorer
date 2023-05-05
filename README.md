# Scroll Explorer

Scroll Explorer is the explorer for the [Scroll](https://scroll.io/) Network. It allows you to search for transactions, blocks, and addresses on the Scroll Network.

## Installation

To install this project, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run `yarn` to install all dependencies.

## Configuration and Setup

Before running the project, you need to configure and set up the environment. Follow these steps:

1. Copy the `.env.example` file to `.env`.
2. Add the necessary environment variables in the `.env` file. For example:

```
DATABASE_URL="postgres://user:password@localhost:5432/mydatabase"
REDIS_URL="redis://localhost:6379"
VERIFICATION_URL="http://localhost:8050"
```

3. Run `yarn prisma:push` to create the necessary database tables.
4. Run `yarn dev` to start the development server.
5. If you need contract verification, you need to run the verification server.

```
cd smart-contract-verifier
docker-compose up
```

## Technologies Used

This project utilizes the following technologies:

- Next.js
- Prisma
- TRPC
- BullMQ

## Contributing

If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Submit a pull request to the main repository.
