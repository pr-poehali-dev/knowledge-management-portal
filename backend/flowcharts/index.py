import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для работы с блок-схемами: создание, редактирование, сохранение'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            doc_id = event.get('queryStringParameters', {}).get('document_id')
            
            if doc_id:
                cur.execute("""
                    SELECT id, document_id, version, flowchart_data, created_at, updated_at
                    FROM flowcharts
                    WHERE document_id = %s
                    ORDER BY updated_at DESC
                    LIMIT 1
                """, (doc_id,))
                row = cur.fetchone()
                
                if row:
                    flowchart = {
                        'id': row[0],
                        'document_id': row[1],
                        'version': row[2],
                        'flowchart_data': row[3],
                        'created_at': row[4].isoformat() if row[4] else None,
                        'updated_at': row[5].isoformat() if row[5] else None
                    }
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'flowchart': flowchart}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Flowchart not found'}),
                        'isBase64Encoded': False
                    }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            document_id = body.get('document_id')
            version = body.get('version', '1.0')
            flowchart_data = body.get('flowchart_data')
            
            cur.execute("""
                INSERT INTO flowcharts (document_id, version, flowchart_data)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (document_id, version, json.dumps(flowchart_data)))
            
            flowchart_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'flowchart_id': flowchart_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            flowchart_id = body.get('flowchart_id')
            flowchart_data = body.get('flowchart_data')
            
            cur.execute("""
                UPDATE flowcharts
                SET flowchart_data = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (json.dumps(flowchart_data), flowchart_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
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