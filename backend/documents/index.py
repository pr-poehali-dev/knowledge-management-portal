import json
import os
import psycopg2
import base64
import uuid
import boto3
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления документами: поиск, загрузка, версионирование'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ['DATABASE_URL']
    schema = os.environ['MAIN_DB_SCHEMA']
    
    try:
        conn = psycopg2.connect(db_url, options=f'-c search_path={schema}')
        cur = conn.cursor()
        
        if method == 'GET':
            query = event.get('queryStringParameters') or {}
            search = query.get('search', '')
            department = query.get('department', '')
            doc_type = query.get('type', '')
            
            sql = """
                SELECT 
                    d.id, d.title, d.description, d.author, d.current_version,
                    d.status, d.tags, d.created_at, d.updated_at,
                    dep.code as dept_code, dep.name as dept_name,
                    dt.code as type_code, dt.name as type_name
                FROM documents d
                LEFT JOIN departments dep ON d.department_id = dep.id
                LEFT JOIN document_types dt ON d.type_id = dt.id
                WHERE 1=1
            """
            
            params = []
            if search:
                sql += " AND (d.title ILIKE %s OR d.description ILIKE %s)"
                params.extend([f'%{search}%', f'%{search}%'])
            
            if department:
                sql += " AND dep.code = %s"
                params.append(department)
            
            if doc_type:
                sql += " AND dt.code = %s"
                params.append(doc_type)
            
            sql += " ORDER BY d.updated_at DESC LIMIT 100"
            
            cur.execute(sql, params)
            rows = cur.fetchall()
            
            documents = []
            for row in rows:
                documents.append({
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'author': row[3],
                    'version': row[4],
                    'status': row[5],
                    'tags': row[6] or [],
                    'created_at': row[7].isoformat() if row[7] else None,
                    'updated_at': row[8].isoformat() if row[8] else None,
                    'department': {'code': row[9], 'name': row[10]} if row[9] else None,
                    'type': {'code': row[11], 'name': row[12]} if row[11] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'documents': documents}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            action = body.get('action')
            
            if action == 'upload':
                title = body.get('title')
                description = body.get('description', '')
                department_code = body.get('department')
                type_code = body.get('type')
                author = body.get('author', 'System')
                file_data = body.get('file_data')
                file_name = body.get('file_name')
                
                cur.execute("SELECT id FROM departments WHERE code = %s", (department_code,))
                dept_row = cur.fetchone()
                dept_id = dept_row[0] if dept_row else None
                
                cur.execute("SELECT id FROM document_types WHERE code = %s", (type_code,))
                type_row = cur.fetchone()
                type_id = type_row[0] if type_row else None
                
                cur.execute("""
                    INSERT INTO documents (title, description, department_id, type_id, author, current_version, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (title, description, dept_id, type_id, author, '1.0', 'published'))
                doc_id = cur.fetchone()[0]
                
                file_url = None
                file_size = None
                
                if file_data and file_name:
                    s3 = boto3.client('s3',
                        endpoint_url='https://bucket.poehali.dev',
                        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                    )
                    
                    file_bytes = base64.b64decode(file_data)
                    file_size = len(file_bytes)
                    
                    file_ext = file_name.split('.')[-1] if '.' in file_name else 'bin'
                    s3_key = f'documents/{doc_id}/{uuid.uuid4()}.{file_ext}'
                    
                    s3.put_object(
                        Bucket='files',
                        Key=s3_key,
                        Body=file_bytes,
                        ContentType=body.get('file_type', 'application/octet-stream')
                    )
                    
                    file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"
                
                cur.execute("""
                    INSERT INTO document_versions (document_id, version, file_url, file_name, file_size, file_type, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (doc_id, '1.0', file_url, file_name, file_size, body.get('file_type'), author))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'document_id': doc_id, 'file_url': file_url}),
                    'isBase64Encoded': False
                }
            
            elif action == 'create':
                title = body.get('title')
                description = body.get('description', '')
                department_code = body.get('department')
                type_code = body.get('type')
                author = body.get('author', 'System')
                
                cur.execute("SELECT id FROM departments WHERE code = %s", (department_code,))
                dept_row = cur.fetchone()
                dept_id = dept_row[0] if dept_row else None
                
                cur.execute("SELECT id FROM document_types WHERE code = %s", (type_code,))
                type_row = cur.fetchone()
                type_id = type_row[0] if type_row else None
                
                cur.execute("""
                    INSERT INTO documents (title, description, department_id, type_id, author, current_version, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (title, description, dept_id, type_id, author, '1.0', 'draft'))
                doc_id = cur.fetchone()[0]
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'document_id': doc_id}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()