INSERT INTO documents (title, description, department_id, type_id, author, current_version, status) 
VALUES 
  (
    'Инструкция по развертыванию информационной системы',
    'Подробное руководство по установке и настройке информационных систем с описанием всех этапов',
    (SELECT id FROM departments WHERE code = 'tech'),
    (SELECT id FROM document_types WHERE code = 'instruction'),
    'Иванов А.П.',
    '2.1',
    'published'
  ),
  (
    'Регламент согласования договоров',
    'Порядок согласования и утверждения договоров в организации',
    (SELECT id FROM departments WHERE code = 'legal'),
    (SELECT id FROM document_types WHERE code = 'process'),
    'Петрова М.И.',
    '1.3',
    'published'
  ),
  (
    'Блок-схема процесса закупки оборудования',
    'Визуальное представление процесса закупки компьютерного оборудования',
    (SELECT id FROM departments WHERE code = 'procurement'),
    (SELECT id FROM document_types WHERE code = 'flowchart'),
    'Сидоров В.К.',
    '3.0',
    'published'
  ),
  (
    'Шаблон технического задания для ИС',
    'Универсальный шаблон для составления технических заданий',
    (SELECT id FROM departments WHERE code = 'projects'),
    (SELECT id FROM document_types WHERE code = 'template'),
    'Кузнецова Л.Н.',
    '1.0',
    'published'
  ),
  (
    'Руководство по работе с системой',
    'Общее руководство пользователя для работы с корпоративными системами',
    (SELECT id FROM departments WHERE code = 'tech'),
    (SELECT id FROM document_types WHERE code = 'guide'),
    'Морозов Д.С.',
    '1.5',
    'published'
  );