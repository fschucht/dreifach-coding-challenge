# dreifach.ai coding-challenge

Welcome to the dreifach.ai coding challenge! 

## Task

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


## Instructions

You can use the programming language you are most comfortable with, though we recommend using TypeScript.
For the message queue you can use any message queue you like, though we recommend using RabbitMQ or Redis.

You can push directly to the main branch of this repository.
