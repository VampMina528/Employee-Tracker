import inquirer from 'inquirer';
import { query } from './employee';

async function mainMenu() {
  while (true) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Choose an action:',
        choices: [
          'View All Employees',
          'Add Employee',
          'Update Employee Role',
          'Exit',
        ],
      },
    ]);

    switch (answers.action) {
      case 'View All Employees':
        await viewEmployees();
        break;
      case 'Add Employee':
        await addEmployee();
        break;
      case 'Update Employee Role':
        await updateEmployeeRole();
        break;
      case 'Exit':
        console.log('Exiting application...');
        process.exit();
    }
  }
}

async function viewEmployees() {
  try {
    const res = await query('SELECT * FROM employees');
    console.table(res.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
  }
}

async function addEmployee() {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'firstName', message: "Enter employee's first name:" },
    { type: 'input', name: 'lastName', message: "Enter employee's last name:" },
    { type: 'input', name: 'roleId', message: "Enter employee's role ID:" },
    { type: 'input', name: 'managerId', message: "Enter manager's ID (or leave blank for none):" },
  ]);

  try {
    await query(
      'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
      [answers.firstName, answers.lastName, answers.roleId, answers.managerId || null]
    );
    console.log('Employee added successfully!');
  } catch (err) {
    console.error('Error adding employee:', err);
  }
}

async function updateEmployeeRole() {
  try {
    const employees = await query('SELECT id, first_name, last_name FROM employees');
    const employeeChoices = employees.rows.map((emp: { id: number; first_name: string; last_name: string }) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.id,
    }));

    const roles = await query('SELECT id, title FROM roles');
    const roleChoices = roles.rows.map((role: { id: number; title: string }) => ({
      name: role.title,
      value: role.id,
    }));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select an employee to update:',
        choices: employeeChoices,
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the new role:',
        choices: roleChoices,
      },
    ]);

    await query('UPDATE employees SET role_id = $1 WHERE id = $2', [answers.roleId, answers.employeeId]);
    console.log('Employee role updated successfully!');
  } catch (err) {
    console.error('Error updating employee role:', err);
  }
}

mainMenu();
