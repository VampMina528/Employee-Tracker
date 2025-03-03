import dotenv from 'dotenv';
dotenv.config();
import inquirer from 'inquirer';
import pg from 'pg';

const { Client } = pg;

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

async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a Department',
        'Add a Role',
        'Add an Employee',
        'Update an Employee Role',
        'Exit'
      ]
    }
  ]);

  switch (action) {
    case 'View All Departments':
      return viewDepartments();
    case 'View All Roles':
      return viewRoles();
    case 'View All Employees':
      return viewEmployees();
    case 'Add a Department':
      return addDepartment();
    case 'Add a Role':
      return addRole();
    case 'Add an Employee':
      return addEmployee();
    case 'Update an Employee Role':
      return updateEmployeeRole();
    case 'Exit':
      console.log('Goodbye!');
      client.end();
      process.exit();
  }
}

async function viewDepartments() {
  try {
    const res = await client.query('SELECT * FROM department');
    console.table(res.rows);
  } catch (err) {
    console.error('Error retrieving departments:', err.message);
  }
  mainMenu();
}

async function viewRoles() {
  try {
    const res = await client.query(`
      SELECT role.id, role.title, department.name AS department, role.salary
      FROM role
      JOIN department ON role.department_id = department.id
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Error retrieving roles:', err.message);
  }
  mainMenu();
}

async function viewEmployees() {
  try {
    const res = await client.query(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title, 
             department.name AS department, role.salary, 
             COALESCE(manager.first_name || ' ' || manager.last_name, 'None') AS manager
      FROM employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
      LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Error retrieving employees:', err.message);
  }
  mainMenu();
}

async function addDepartment() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the department name:',
      validate: input => input ? true : 'Department name cannot be empty.'
    }
  ]);

  try {
    await client.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log(`Department "${name}" added successfully.`);
  } catch (err) {
    console.error('Error adding department:', err.message);
  }
  mainMenu();
}

async function addRole() {
  const departments = await client.query('SELECT * FROM department');
  const { title, salary, department_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the role title:',
      validate: input => input ? true : 'Role title cannot be empty.'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for this role:',
      validate: input => isNaN(input) ? 'Please enter a valid salary.' : true
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department for this role:',
      choices: departments.rows.map(dept => ({ name: dept.name, value: dept.id }))
    }
  ]);

  try {
    await client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
    console.log(`Role "${title}" added successfully.`);
  } catch (err) {
    console.error('Error adding role:', err.message);
  }
  mainMenu();
}

async function addEmployee() {
  const roles = await client.query('SELECT * FROM role');
  const employees = await client.query('SELECT * FROM employee');

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: "Enter the employee's first name:",
      validate: input => input ? true : 'First name cannot be empty.'
    },
    {
      type: 'input',
      name: 'last_name',
      message: "Enter the employee's last name:",
      validate: input => input ? true : 'Last name cannot be empty.'
    },
    {
      type: 'list',
      name: 'role_id',
      message: "Select the employee's role:",
      choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
    },
    {
      type: 'list',
      name: 'manager_id',
      message: "Select the employee's manager (if any):",
      choices: [{ name: 'None', value: null }, ...employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))]
    }
  ]);

  try {
    await client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]);
    console.log(`Employee "${first_name} ${last_name}" added successfully.`);
  } catch (err) {
    console.error('Error adding employee:', err.message);
  }
  mainMenu();
}

async function updateEmployeeRole() {
  const employees = await client.query('SELECT * FROM employee');
  const roles = await client.query('SELECT * FROM role');

  const { employee_id, new_role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: "Select the employee to update:",
      choices: employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
    },
    {
      type: 'list',
      name: 'new_role_id',
      message: "Select the employee's new role:",
      choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
    }
  ]);

  try {
    await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [new_role_id, employee_id]);
    console.log('Employee role updated successfully.');
  } catch (err) {
    console.error('Error updating employee role:', err.message);
  }
  mainMenu();
}
