from django.shortcuts import render,redirect
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
import mysql.connector
from .db_utils import get_db_connection
import mysql
import logging
import plotly.express as px


def plotly_graphs():
    return [
        "scatter","line","bar","pie","histogram","box","violin",
        "density_heatmap","scatter3d","scatter_matrix","ecdf"
        ]

# Create your views here.

def index(request):
    return render(request,'index.html')


def home(request):
    plotly_options = plotly_graphs()

    return render(request,'home.html',{
        "plotly_options" : plotly_options,
        })
@csrf_exempt
def generate_graph(request):
    if request.method == "POST":
        try:
            # Get the uploaded file
            uploaded_file = request.FILES.get("file")
            if not uploaded_file:
                logger.error("No file uploaded.")
                return JsonResponse({"error": "No file uploaded."}, status=400)

            # Read the CSV file into a pandas DataFrame
            try:
                df = pd.read_csv(uploaded_file)
            except pd.errors.EmptyDataError:
                return JsonResponse({"error": "The file is empty."}, status=400)
            except pd.errors.ParserError:
                return JsonResponse({"error": "The file could not be parsed as a CSV."}, status=400)

            # Clean column names: remove leading/trailing whitespace and convert to lowercase
            df.columns = df.columns.str.strip().str.lower()

            # Get the selected graph type and columns from the form
            graph_type = request.POST.get("graphs")
            x_axis = request.POST.get("x", "").strip().lower()
            y_axis = request.POST.get("y", "").strip().lower()
            color_input = request.POST.get("color", "").strip().lower()
            hover_name_input = request.POST.get('hover_name', "").strip().lower()
            line_group_input = request.POST.get('line_group', "").strip().lower()
            pattern_shape_input = request.POST.get('pattern_shape', "").strip().lower()
            values_input = request.POST.get('values', "").strip().lower()
            names_input = request.POST.get('names', "").strip().lower()

            # Validate required columns
            if graph_type not in ["pie", "ecdf"]:  # Graphs that don't require x and y axes
                if not x_axis or x_axis not in df.columns:
                    return JsonResponse({"error": f"Column '{x_axis}' does not exist in the file."}, status=400)
                if not y_axis or y_axis not in df.columns:
                    return JsonResponse({"error": f"Column '{y_axis}' does not exist in the file."}, status=400)

            # Generate the graph using Plotly Express
            if graph_type == "scatter":
                fig = px.scatter(
                    df,
                    x=x_axis,
                    y=y_axis,
                    title=f"Scatter Plot of {x_axis} vs {y_axis}",
                    labels={x_axis: x_axis.capitalize(), y_axis: y_axis.capitalize()},
                    color=color_input if color_input else None,
                )
            elif graph_type == "line":
                fig = px.line(
                    df,
                    x=x_axis,
                    y=y_axis,
                    title=f"Line Plot of {x_axis} vs {y_axis}",
                    labels={x_axis: x_axis.capitalize(), y_axis: y_axis.capitalize()},
                    line_shape='spline',
                    color=color_input if color_input else None,
                    hover_name=hover_name_input if hover_name_input else None,
                    line_group=line_group_input if line_group_input else None,
                    render_mode="svg",
                )
            elif graph_type == "bar":
                fig = px.bar(
                    df,
                    x=x_axis,
                    y=y_axis,
                    title=f"Bar Plot of {x_axis} vs {y_axis}",
                    color=color_input if color_input else None,
                    pattern_shape=pattern_shape_input if pattern_shape_input else None,
                )
            elif graph_type == "pie":
                if not values_input or values_input not in df.columns:
                    return JsonResponse({"error": f"Column '{values_input}' does not exist in the file."}, status=400)
                if not names_input or names_input not in df.columns:
                    return JsonResponse({"error": f"Column '{names_input}' does not exist in the file."}, status=400)
                fig = px.pie(
                    df,
                    values=values_input,
                    names=names_input,
                    title=f"Pie Chart of {values_input}",
                )
            elif graph_type == "histogram":
                fig = px.histogram(
                    df,
                    x=x_axis,
                    y=y_axis,
                    color=color_input if color_input else None,
                    hover_data=df.columns,
                    marginal='rug',
                )
            elif graph_type == "box":
                fig = px.box(
                    df,
                    x=x_axis,
                    y=y_axis,
                    color=color_input if color_input else None,
                    notched=True,
                )
            elif graph_type == "violin":
                fig = px.violin(
                    df,
                    x=x_axis,
                    y=y_axis,
                    color=color_input if color_input else None,
                )
            elif graph_type == "density_heatmap":
                fig = px.density_heatmap(
                    df,
                    x=x_axis,
                    y=y_axis,
                )
            elif graph_type == "scatter3d":
                z_axis = request.POST.get("z", "").strip().lower()
                if not z_axis or z_axis not in df.columns:
                    return JsonResponse({"error": f"Column '{z_axis}' does not exist in the file."}, status=400)
                fig = px.scatter_3d(
                    df,
                    x=x_axis,
                    y=y_axis,
                    z=z_axis,
                    color=color_input if color_input else None,
                )
            elif graph_type == "scatter_matrix":
                dimensions = request.POST.getlist("dimensions")
                dimensions = [dim.strip().lower() for dim in dimensions]
                invalid_dimensions = [dim for dim in dimensions if dim not in df.columns]
                if invalid_dimensions:
                    return JsonResponse({"error": f"Columns {invalid_dimensions} do not exist in the file."}, status=400)
                fig = px.scatter_matrix(
                    df,
                    dimensions=dimensions,
                    color=color_input if color_input else None,
                )
            elif graph_type == "ecdf":
                fig = px.ecdf(
                    df,
                    x=x_axis,
                    color=color_input if color_input else None,
                )
            else:
                logger.error(f"Invalid graph type selected: {graph_type}")
                return JsonResponse({"error": "Invalid graph type selected."}, status=400)

            # Convert the graph to JSON
            graph_json = fig.to_json()

            # Return the graph JSON as a response
            return JsonResponse({"graph_json": graph_json})
        except Exception as e:
            logger.error(f"Error generating graph: {str(e)}", exc_info=True)
            return JsonResponse({"error": f"Error generating graph: {str(e)}"}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)
logger = logging.getLogger(__name__)

@csrf_exempt
def upload_file(request):
    if request.method == "POST" and request.FILES.get("file"):
        uploaded_file = request.FILES["file"]
        file_path = default_storage.save(uploaded_file.name, uploaded_file)

        try:
            # Read the CSV file using pandas
            df = pd.read_csv(default_storage.path(file_path))

            # Basic file information
            file_info = {
                "file_name": uploaded_file.name,
                "file_size": f"{(uploaded_file.size / 1024):.2f} KB",
                "num_rows": len(df),
                "num_columns": len(df.columns),
            }

            # Column information
            column_info = []
            for column in df.columns:
                column_info.append({
                    "name": column,
                    "data_type": str(df[column].dtype),
                    "missing_values": int(df[column].isnull().sum()),
                    "unique_values": int(df[column].nunique()),
                })

            # Data preview (first 5 rows) as an HTML table
            data_preview_html = df.head(100).to_html(classes="data-preview-table", index=True)

            # Log the response data
            logger.info("File Info: %s", file_info)
            logger.info("Column Info: %s", column_info)
            logger.info("Data Preview HTML: %s", data_preview_html)

            # Return the data as JSON
            return JsonResponse({
                "file_info": file_info,
                "column_info": column_info,
                "data_preview_html": data_preview_html,
            })
        except pd.errors.EmptyDataError:
            logger.error("The file is empty.")
            return JsonResponse({"error": "The file is empty."}, status=400)
        except pd.errors.ParserError:
            logger.error("The file could not be parsed as a CSV.")
            return JsonResponse({"error": "The file could not be parsed as a CSV."}, status=400)
        except Exception as e:
            logger.error("Error processing file: %s", str(e))
            return JsonResponse({"error": f"Error processing file: {str(e)}"}, status=400)
        finally:
            # Clean up: Delete the file after processing
            default_storage.delete(file_path)
    logger.error("No file uploaded")
    return JsonResponse({"error": "No file uploaded"}, status=400)


@csrf_exempt
def calculate_statistics(request):
    if request.method == "POST" and request.FILES.get("file"):
        uploaded_file = request.FILES["file"]
        column = request.POST.get("column")  # Get the selected column

        try:
            # Read the CSV file using pandas
            df = pd.read_csv(uploaded_file)

            # Clean column names: remove leading/trailing whitespace and convert to lowercase
            df.columns = df.columns.str.strip().str.lower()
            column = column.strip().lower()  # Clean the selected column name

            # Check if the column exists
            if column not in df.columns:
                return JsonResponse({"success": False, "error": f"Column '{column}' does not exist in the file."})

            # Convert the column to numeric, coercing errors (non-numeric values become NaN)
            numeric_column = pd.to_numeric(df[column], errors='coerce')

            # Drop NaN values (skip empty or invalid values)
            numeric_column = numeric_column.dropna()

            # Check if there are any numeric values left after dropping NaN
            if numeric_column.empty:
                return JsonResponse({"success": False, "error": f"Column '{column}' contains no valid numeric data."})

            # Calculate statistics (Pandas functions automatically skip NaN values)
            stats = {
                "mean": float(numeric_column.mean()),  # Convert to float
                "median": float(numeric_column.median()),  # Convert to float
                "std": float(numeric_column.std()),  # Convert to float
                "min": float(numeric_column.min()),  # Convert to float
                "max": float(numeric_column.max()),  # Convert to float
                "variance": float(numeric_column.var()),  # Convert to float
            }

            # Debug: Print the calculated statistics
            print(f"Stats for column '{column}':", stats)

            return JsonResponse({"success": True, "stats": stats})
        except Exception as e:
            # Log the error for debugging
            print(f"Error calculating statistics: {str(e)}")
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Invalid request method or missing file."})

def signin(request):
    if request.method == 'POST':
        
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        # connect to database
        connection = get_db_connection()
        cursor = connection.cursor()

        # Retrieve the user from the database

        try:
            query = "SELECT * FROM users WHERE email = %s AND password = %s"
            cursor.execute(query,(email,password))
            user = cursor.fetchone() # fetch the first matching row
            if user:
                #pass a success message to the template
                success_message = 'You have logged in successfully! 😊'
                return render(request,'signin.html',{'success_message' : success_message})
            else:
                error_message = 'Invalid email or password☹️'
                return render(request,'signin.html',{"error_message" : error_message})
        except mysql.connector.Error as err:
            print(f"Error : {err}")
        finally:
            cursor.close()
            connection.close()

    return render(request,"signin.html")



def signup(request):
    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor()

        # insert the user into the database
        try:
            # Check if the email already exists
            query2 = "SELECT * FROM users WHERE email = %s"
            cursor.execute(query2,(email,))
            user = cursor.fetchone()

            if user:
                # Email already exists, show error message
                error_message = "Email is already taken ☹️. Please use a different email"
                return render(request,"signup.html",{"error_message" : error_message})
            
            # Insert the user into the database if email is unique
            query = "INSERT INTO users(username,email,password) VALUES (%s,%s,%s)"
            cursor.execute(query,(username,email,password))
            connection.commit()
            print("user inserted successfuly !")
            
            success_message = "Signup successful! You can now sign in. 😊"
            return render(request,"signup.html",{"success_message" : success_message})
        except mysql.connector.Error as err:
            print(f"Error : {err}")
        finally:
            cursor.close()
            connection.close()
    return render(request,"signup.html")

