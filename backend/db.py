import psycopg2

conn=psycopg2.connect( host="localhost",
    database="college_db",
    user="postgres",
    password="1117"
    )


cur=conn.cursor()

cur.execute("""
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
""")


cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) CHECK (role IN('student','teacher')) NOT NULL,
            linked_id VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

            """)


cur.execute("""
                CREATE TABLE IF NOT EXISTS students (
            id VARCHAR(20) PRIMARY KEY,
            name VARCHAR(255) NOT NULL, 
            branch VARCHAR(100) NOT NULL
        );

""")

cur.execute("""
CREATE TABLE IF NOT EXISTS professors (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(20) PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    professor_id VARCHAR(20) REFERENCES professors(id)
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS timetable(
            id SERIAL PRIMARY KEY,
            course_id VARCHAR(20) REFERENCES courses(id),
            day VARCHAR(20) NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL
            );
            """)


cur.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) REFERENCES students(id),
        course_id VARCHAR(20) REFERENCES courses(id),
        date DATE NOT NULL,
        status VARCHAR(10) CHECK (status IN ('present', 'absent')) NOT NULL
            );
""")



cur.execute("INSERT INTO professors (id,name, email) VALUES (%s,%s, %s) RETURNING id", ("RVCE1233","Prof. Rao", "rao@rvce.edu"))
prof_id = cur.fetchone()[0]
print(prof_id)

cur.execute("INSERT INTO courses (id,course_name, professor_id) VALUES (%s,%s, %s) RETURNING id", ("XXX213","DBMS", prof_id))
course_id = cur.fetchone()[0]
print(course_id)
cur.execute("INSERT INTO students (id,name, branch) VALUES (%s, %s, %s)", ("RVCE001","Jason Alva", "ISE"))

cur.execute("INSERT INTO timetable (course_id, day, start_time, end_time) VALUES (%s, %s, %s, %s)", 
            (course_id, "Monday", "10:00", "11:00"))

cur.execute("INSERT INTO attendance (student_id, course_id, date, status) VALUES (%s, %s, %s, %s)",
            ("RVCE001", course_id, "2025-10-25", "present"))

cur.execute("""
INSERT INTO users (email, password_hash, role, linked_id)
VALUES (%s, %s, %s, %s)
""", ("rao@rvce.edu", "hashed_password_here", "teacher", prof_id))

# For student
cur.execute("""
INSERT INTO users (email, password_hash, role, linked_id)
VALUES (%s, %s, %s, %s)
""", ("jason@rvce.edu", "hashed_password_here", "student", "RVCE001"))


conn.commit()
print("✅ Tables created successfully!")

cur.close()
conn.close()