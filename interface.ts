export interface Department {
    id: number;
    name: string;
  }
  
  export interface Role {
    id: number;
    title: string;
    salary: number;
    department_id: number;
  }
  
  export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    role_id: number;
    manager_id?: number;
  }
