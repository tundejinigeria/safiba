/**
 * Creates the required DynamoDB tables for Safiba.
 * Run once before starting the app:
 *   node scripts/setup-aws.mjs
 */

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

const region = process.env.AWS_REGION ?? 'eu-west-1';
const client = new DynamoDBClient({ region });

const tables = [
  {
    TableName: process.env.DYNAMODB_WAITLIST_TABLE ?? 'safiba-waitlist',
    KeySchema: [
      { AttributeName: 'pk', KeyType: 'HASH' },
      { AttributeName: 'sk', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'pk', AttributeType: 'S' },
      { AttributeName: 'sk', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`\nSetting up DynamoDB tables in region: ${region}\n`);

  for (const table of tables) {
    const exists = await tableExists(table.TableName);
    if (exists) {
      console.log(`  ✓ ${table.TableName} already exists — skipping`);
      continue;
    }

    try {
      await client.send(new CreateTableCommand(table));
      console.log(`  ✓ Created table: ${table.TableName}`);
    } catch (err) {
      console.error(`  ✗ Failed to create ${table.TableName}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\nDone. Tables are ready.\n');
}

main();
