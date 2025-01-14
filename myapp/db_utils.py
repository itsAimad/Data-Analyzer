import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="data_analyzer",
        port=3308,
    )

    return connection

# try:
#     connection  = get_db_connection()
#     print("yeees")
# except mysql.connector.Error as err:
#     print(f"err {err}")