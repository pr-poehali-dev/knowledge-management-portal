import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import FlowchartEditor from '@/components/FlowchartEditor';

const DOCUMENTS_API = 'https://functions.poehali.dev/8ed7141d-b310-44c7-925b-e846ed249265';

interface Document {
  id: number;
  title: string;
  description?: string;
  author: string;
  version: string;
  status: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  department?: { code: string; name: string };
  type?: { code: string; name: string };
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [flowchartDialogOpen, setFlowchartDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    type: '',
    author: ''
  });

  const departments = [
    { id: 'tech', name: 'Технический отдел', icon: 'Server', count: 0, color: 'bg-blue-500' },
    { id: 'docs', name: 'Делопроизводство', icon: 'FileText', count: 0, color: 'bg-green-500' },
    { id: 'legal', name: 'Юридическая служба', icon: 'Scale', count: 0, color: 'bg-purple-500' },
    { id: 'procurement', name: 'Закупочная служба', icon: 'ShoppingCart', count: 0, color: 'bg-orange-500' },
    { id: 'projects', name: 'Управление проектами', icon: 'FolderKanban', count: 0, color: 'bg-cyan-500' },
  ];

  const documentTypes = [
    { code: 'instruction', name: 'Инструкция' },
    { code: 'process', name: 'Процесс' },
    { code: 'flowchart', name: 'Блок-схема' },
    { code: 'template', name: 'Шаблон' },
    { code: 'regulation', name: 'Регламент' },
    { code: 'guide', name: 'Руководство' },
  ];

  const quickActions = [
    { label: 'Создать инструкцию', icon: 'FilePlus', action: 'create-instruction' },
    { label: 'Загрузить документ', icon: 'Upload', action: 'upload-doc' },
    { label: 'Построить блок-схему', icon: 'GitBranch', action: 'create-flowchart' },
    { label: 'Новый процесс', icon: 'Workflow', action: 'create-process' },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchQuery, activeSection, documents]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(DOCUMENTS_API);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      toast.error('Ошибка загрузки документов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeSection !== 'all') {
      filtered = filtered.filter(doc => doc.department?.code === activeSection);
    }

    setFilteredDocuments(filtered);
  };

  const handleQuickAction = (action: string) => {
    setSelectedAction(action);
    if (action === 'create-flowchart') {
      setFlowchartDialogOpen(true);
    } else if (action === 'upload-doc') {
      setUploadDialogOpen(true);
    } else if (action === 'create-instruction' || action === 'create-process') {
      setFormData({
        ...formData,
        type: action === 'create-instruction' ? 'instruction' : 'process'
      });
      setCreateDialogOpen(true);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const response = await fetch(DOCUMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...formData
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Документ успешно создан');
        setCreateDialogOpen(false);
        setFormData({ title: '', description: '', department: '', type: '', author: '' });
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Ошибка создания документа');
      console.error(error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result?.toString().split(',')[1];
      
      try {
        const response = await fetch(DOCUMENTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload',
            ...formData,
            file_data: base64,
            file_name: file.name,
            file_type: file.type
          })
        });

        const data = await response.json();
        if (data.success) {
          toast.success('Файл успешно загружен');
          setUploadDialogOpen(false);
          setFormData({ title: '', description: '', department: '', type: '', author: '' });
          fetchDocuments();
        }
      } catch (error) {
        toast.error('Ошибка загрузки файла');
        console.error(error);
      }
    };
    reader.readAsDataURL(file);
  };

  const getTypeLabel = (type: string) => {
    return documentTypes.find(t => t.code === type)?.name || type;
  };

  const getDepartmentName = (code: string) => {
    return departments.find(d => d.id === code)?.name || '';
  };

  const getDocumentStats = () => {
    const stats = {
      total: documents.length,
      instructions: documents.filter(d => d.type?.code === 'instruction').length,
      flowcharts: documents.filter(d => d.type?.code === 'flowchart').length,
      processes: documents.filter(d => d.type?.code === 'process').length,
    };
    return stats;
  };

  const stats = getDocumentStats();

  const updatedDepartments = departments.map(dept => ({
    ...dept,
    count: documents.filter(d => d.department?.code === dept.id).length
  }));

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'недавно';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'только что';
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'час' : 'часа'} назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дня назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-72 border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="BookOpen" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">ГБУ ЦИР ПК</h1>
              <p className="text-xs text-sidebar-foreground/70">Система управления знаниями</p>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="space-y-1 p-4">
            <Button
              variant={activeSection === 'all' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('all')}
            >
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </Button>

            <div className="pt-4 pb-2">
              <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                Отделы
              </h3>
            </div>

            {updatedDepartments.map((dept) => (
              <Button
                key={dept.id}
                variant={activeSection === dept.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection(dept.id)}
              >
                <Icon name={dept.icon} size={18} className="mr-2" />
                <span className="flex-1 text-left truncate">{dept.name}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {dept.count}
                </Badge>
              </Button>
            ))}

            <div className="pt-4 pb-2">
              <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                Избранное
              </h3>
            </div>

            <Button variant="ghost" className="w-full justify-start">
              <Icon name="Star" size={18} className="mr-2" />
              Мои документы
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Icon name="Clock" size={18} className="mr-2" />
              Недавние
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Icon name="Archive" size={18} className="mr-2" />
              Архив
            </Button>
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по инструкциям, процессам, документам..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Button variant="outline" size="icon">
            <Icon name="Bell" size={20} />
          </Button>
          <Button variant="outline" size="icon">
            <Icon name="Settings" size={20} />
          </Button>
          <Button variant="outline" className="gap-2">
            <Icon name="User" size={18} />
            Профиль
          </Button>
        </header>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Добро пожаловать в систему управления знаниями</h2>
            <p className="text-muted-foreground mt-2">
              Централизованное хранилище инструкций, процессов и документации ГБУ ЦИР ПК
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card 
                key={action.action} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleQuickAction(action.action)}
              >
                <CardContent className="pt-6 pb-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name={action.icon} size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{action.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {activeSection === 'all' ? 'Все документы' : getDepartmentName(activeSection)}
                </CardTitle>
                <CardDescription>
                  {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Последние обновления в системе'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Документы не найдены</div>
                ) : (
                  <div className="space-y-4">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="FileText" size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 truncate">{doc.title}</h4>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            {doc.type && (
                              <Badge variant="outline" className="text-xs">
                                {doc.type.name}
                              </Badge>
                            )}
                            {doc.department && <span>{doc.department.name}</span>}
                            <span>•</span>
                            <span>v{doc.version}</span>
                            <span>•</span>
                            <span>{doc.author}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {getTimeAgo(doc.updated_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Статистика</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Всего документов</span>
                      <span className="font-semibold">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Инструкций</span>
                      <span className="font-semibold">{stats.instructions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Блок-схем</span>
                      <span className="font-semibold">{stats.flowcharts}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Процессов</span>
                      <span className="font-semibold">{stats.processes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Быстрые ссылки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    База знаний
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Icon name="Users" size={16} className="mr-2" />
                    Команды
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Icon name="BarChart3" size={16} className="mr-2" />
                    Отчёты
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Icon name="HelpCircle" size={16} className="mr-2" />
                    Помощь
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Отделы и направления</CardTitle>
              <CardDescription>Навигация по структуре компании</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full" value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  {updatedDepartments.map((dept) => (
                    <TabsTrigger key={dept.id} value={dept.id}>
                      {dept.name.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {updatedDepartments.map((dept) => (
                      <Card key={dept.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className={`h-12 w-12 rounded-lg ${dept.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon name={dept.icon} size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{dept.name}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {dept.count} документов
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => setActiveSection(dept.id)}
                              >
                                Открыть раздел
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {updatedDepartments.map((dept) => (
                  <TabsContent key={dept.id} value={dept.id} className="space-y-4 mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`h-16 w-16 rounded-lg ${dept.color} flex items-center justify-center`}>
                            <Icon name={dept.icon} size={32} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">{dept.name}</h3>
                            <p className="text-muted-foreground">{dept.count} документов в базе</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-lg border">
                            <div className="text-3xl font-bold text-primary mb-1">
                              {documents.filter(d => d.department?.code === dept.id && d.type?.code === 'instruction').length}
                            </div>
                            <p className="text-sm text-muted-foreground">Инструкции</p>
                          </div>
                          <div className="p-4 rounded-lg border">
                            <div className="text-3xl font-bold text-primary mb-1">
                              {documents.filter(d => d.department?.code === dept.id && d.type?.code === 'process').length}
                            </div>
                            <p className="text-sm text-muted-foreground">Процессы</p>
                          </div>
                          <div className="p-4 rounded-lg border">
                            <div className="text-3xl font-bold text-primary mb-1">
                              {documents.filter(d => d.department?.code === dept.id && d.type?.code === 'flowchart').length}
                            </div>
                            <p className="text-sm text-muted-foreground">Блок-схемы</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый документ</DialogTitle>
            <DialogDescription>
              Заполните информацию о документе
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Введите название документа"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание"
              />
            </div>
            <div>
              <Label htmlFor="department">Отдел</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Тип документа</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.code} value={type.code}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="author">Автор</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="ФИО автора"
              />
            </div>
            <Button onClick={handleCreateDocument} className="w-full">Создать документ</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить документ</DialogTitle>
            <DialogDescription>
              Загрузите файл и заполните метаданные
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title-upload">Название</Label>
              <Input
                id="title-upload"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Введите название документа"
              />
            </div>
            <div>
              <Label htmlFor="description-upload">Описание</Label>
              <Textarea
                id="description-upload"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание"
              />
            </div>
            <div>
              <Label htmlFor="department-upload">Отдел</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-upload">Тип документа</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.code} value={type.code}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="author-upload">Автор</Label>
              <Input
                id="author-upload"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="ФИО автора"
              />
            </div>
            <div>
              <Label htmlFor="file">Файл</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={flowchartDialogOpen} onOpenChange={setFlowchartDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Редактор блок-схем</DialogTitle>
            <DialogDescription>
              Создайте визуальную блок-схему процесса
            </DialogDescription>
          </DialogHeader>
          <FlowchartEditor />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
