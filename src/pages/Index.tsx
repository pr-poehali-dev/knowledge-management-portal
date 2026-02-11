import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('all');

  const departments = [
    { id: 'tech', name: 'Технический отдел', icon: 'Server', count: 127, color: 'bg-blue-500' },
    { id: 'docs', name: 'Делопроизводство', icon: 'FileText', count: 89, color: 'bg-green-500' },
    { id: 'legal', name: 'Юридическая служба', icon: 'Scale', count: 64, color: 'bg-purple-500' },
    { id: 'procurement', name: 'Закупочная служба', icon: 'ShoppingCart', count: 52, color: 'bg-orange-500' },
    { id: 'projects', name: 'Управление проектами', icon: 'FolderKanban', count: 98, color: 'bg-cyan-500' },
  ];

  const recentDocuments = [
    {
      id: 1,
      title: 'Инструкция по развертыванию информационной системы',
      department: 'tech',
      type: 'instruction',
      updated: '2 часа назад',
      author: 'Иванов А.П.',
      version: '2.1'
    },
    {
      id: 2,
      title: 'Регламент согласования договоров',
      department: 'legal',
      type: 'process',
      updated: '5 часов назад',
      author: 'Петрова М.И.',
      version: '1.3'
    },
    {
      id: 3,
      title: 'Блок-схема процесса закупки оборудования',
      department: 'procurement',
      type: 'flowchart',
      updated: 'вчера',
      author: 'Сидоров В.К.',
      version: '3.0'
    },
    {
      id: 4,
      title: 'Шаблон технического задания для ИС',
      department: 'projects',
      type: 'template',
      updated: '2 дня назад',
      author: 'Кузнецова Л.Н.',
      version: '1.0'
    },
  ];

  const quickActions = [
    { label: 'Создать инструкцию', icon: 'FilePlus', action: 'create-instruction' },
    { label: 'Загрузить документ', icon: 'Upload', action: 'upload-doc' },
    { label: 'Построить блок-схему', icon: 'GitBranch', action: 'create-flowchart' },
    { label: 'Новый процесс', icon: 'Workflow', action: 'create-process' },
  ];

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      instruction: 'Инструкция',
      process: 'Процесс',
      flowchart: 'Блок-схема',
      template: 'Шаблон',
    };
    return types[type] || type;
  };

  const getDepartmentName = (id: string) => {
    return departments.find(d => d.id === id)?.name || '';
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

            {departments.map((dept) => (
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
              <Card key={action.action} className="hover:shadow-md transition-shadow cursor-pointer">
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
                <CardTitle>Недавние документы</CardTitle>
                <CardDescription>Последние обновления в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 truncate">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(doc.type)}
                          </Badge>
                          <span>{getDepartmentName(doc.department)}</span>
                          <span>•</span>
                          <span>v{doc.version}</span>
                          <span>•</span>
                          <span>{doc.author}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {doc.updated}
                      </div>
                    </div>
                  ))}
                </div>
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
                      <span className="font-semibold">430</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Инструкций</span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Блок-схем</span>
                      <span className="font-semibold">89</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Процессов</span>
                      <span className="font-semibold">185</span>
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
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  {departments.map((dept) => (
                    <TabsTrigger key={dept.id} value={dept.id}>
                      {dept.name.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
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
                              <Button variant="outline" size="sm" className="w-full">
                                Открыть раздел
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {departments.map((dept) => (
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
                              {Math.floor(dept.count * 0.4)}
                            </div>
                            <p className="text-sm text-muted-foreground">Инструкции</p>
                          </div>
                          <div className="p-4 rounded-lg border">
                            <div className="text-3xl font-bold text-primary mb-1">
                              {Math.floor(dept.count * 0.3)}
                            </div>
                            <p className="text-sm text-muted-foreground">Процессы</p>
                          </div>
                          <div className="p-4 rounded-lg border">
                            <div className="text-3xl font-bold text-primary mb-1">
                              {Math.floor(dept.count * 0.3)}
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
    </div>
  );
};

export default Index;