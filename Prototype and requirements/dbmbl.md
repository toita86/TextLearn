// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

Table users {
  id integer [primary key]
  username varchar
  email varcahr
  password varchar
  bio varchar
}

Table courses {
  id integer [primary key]
  author varchar [ref: > users.id]
  course_name varchar
  desc varchar
  thumbnail varchar
  file_path varchar
}

Table user_sub_course {
  user_id integer [ref: > users.id]
  course_id integer [ref: > courses.id]
  indexes {
    (user_id, course_id) [pk]
  }
}

/*
Ref user_sub_courses {
  users.(id) <> courses.(id)
}
*/