import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="your host",
        user="your username",
        password="your password",
        database="your database",
        port=your port,
    )

    return connection

# try:
#     connection  = get_db_connection()
#     print("yeees")
# except mysql.connector.Error as err:
#     print(f"err {err}")
