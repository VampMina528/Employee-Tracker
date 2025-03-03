import dotenv from 'dotenv';
import inquirer from 'inquirer';
import pkg from 'pg';

dotenv.config();

const { Client } = pkg;

const client = new Client({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('Connected to the database.');
    mainMenu();
  })
  .catch(err => console.error('Connection error', err.stack));

function mainMenu() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: ['View Departments', 'Exit']
    }
  ])
  .then(answer => {
    if (answer.action === 'View Departments') {
      viewDepartments();
    } else {
      console.log('Goodbye!');
      client.end();
    }
  })
  .catch(err => console.error('Error with inquirer', err));
}

function viewDepartments() {
    client.query('SELECT * FROM departments')
      .then(res => {
        if (res.rows.length === 0) {
          console.log('No departments found in the database.');
        } else {
          console.table(res.rows);
        }
        mainMenu();
      })
      .catch(err => {
        console.error('Error executing query', err.stack);
        mainMenu();
      });
  }
  