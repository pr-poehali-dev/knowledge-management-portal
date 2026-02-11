CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    department_id INTEGER REFERENCES departments(id),
    type_id INTEGER REFERENCES document_types(id),
    author VARCHAR(255),
    current_version VARCHAR(20),
    status VARCHAR(50) DEFAULT 'draft',
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_versions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    version VARCHAR(20) NOT NULL,
    file_url TEXT,
    file_name VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    changes_description TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, version)
);

CREATE TABLE IF NOT EXISTS flowcharts (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    version VARCHAR(20),
    flowchart_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_department ON documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_document_versions_doc_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_flowcharts_doc_id ON flowcharts(document_id);

INSERT INTO departments (code, name, icon, color) VALUES
    ('tech', 'Технический отдел', 'Server', 'bg-blue-500'),
    ('docs', 'Делопроизводство', 'FileText', 'bg-green-500'),
    ('legal', 'Юридическая служба', 'Scale', 'bg-purple-500'),
    ('procurement', 'Закупочная служба', 'ShoppingCart', 'bg-orange-500'),
    ('projects', 'Управление проектами', 'FolderKanban', 'bg-cyan-500')
ON CONFLICT (code) DO NOTHING;

INSERT INTO document_types (code, name) VALUES
    ('instruction', 'Инструкция'),
    ('process', 'Процесс'),
    ('flowchart', 'Блок-схема'),
    ('template', 'Шаблон'),
    ('regulation', 'Регламент'),
    ('guide', 'Руководство')
ON CONFLICT (code) DO NOTHING;