INSERT INTO departments (department_name) 
VALUES
    ('Engineering'),
    ('Finance'),
    ('Human Resources'),
    ('Sales');

INSERT INTO roles (title, salary, department_id) 
VALUES
    ('Software Engineer', 80000, 1),
    ('Senior Engineer', 100000, 1),
    ('Accountant', 75000, 2),
    ('HR Manager', 90000, 3),
    ('Sales Representative', 60000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id) 
VALUES
    ('Jimi', 'Hendrix', 1, NULL),
    ('Zakk', 'Wylde', 2, 1),
    ('Eddie', 'Van Halen', 3, NULL),
    ('Randy', 'Rhoads', 4, NULL),
    ('Andy', 'LaRoque', 5, NULL);
