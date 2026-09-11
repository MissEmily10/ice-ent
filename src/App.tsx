import { useEffect, useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, Check, ChevronRight, CircleHelp, FileText, Inbox, LayoutGrid, Menu, Paperclip, Plus, Send, Settings2, SlidersHorizontal, Users, X } from 'lucide-react'

type View = 'catalog' | 'applications' | 'admin'
type Scope = 'all' | 'channel' | 'groups'
type Status = 'pending' | 'accepted' | 'rejected'

type Position = { id: number; title: string; group: string; description: string; isChannel: boolean; isOpen: boolean; applicants: number; accent: string }

const positions: Position[] = [
  { id: 1, title: 'Редактор новостей', group: 'ICE Community', description: 'Собирайте главное за день, проверяйте факты и задавайте ритм нашему каналу.', isChannel: true, isOpen: true, applicants: 8, accent: 'orange' },
  { id: 2, title: 'Модератор', group: 'ICE Community', description: 'Помогайте сохранять атмосферу, отвечайте на вопросы и следите за правилами.', isChannel: true, isOpen: true, applicants: 14, accent: 'blue' },
  { id: 3, title: 'Дизайнер обложек', group: 'ICE Community', description: 'Создавайте обложки для постов, которые хочется открыть с первого взгляда.', isChannel: true, isOpen: false, applicants: 6, accent: 'lilac' },
  { id: 4, title: 'Организатор встреч', group: 'North Club', description: 'Придумывайте камерные встречи и превращайте чат в живое сообщество.', isChannel: false, isOpen: true, applicants: 5, accent: 'green' },
  { id: 5, title: 'Модератор чата', group: 'North Club', description: 'Поддерживайте дружелюбный порядок в вечерних обсуждениях.', isChannel: false, isOpen: true, applicants: 11, accent: 'coral' },
  { id: 6, title: 'Куратор книжного клуба', group: 'Reading Room', description: 'Выбирайте книги месяца и ведите разговоры, которые не хочется заканчивать.', isChannel: false, isOpen: false, applicants: 4, accent: 'yellow' },
]

const submissions: { title: string; group: string; date: string; status: Status }[] = [
  { title: 'Модератор', group: 'ICE Community', date: '12 сентября 2026', status: 'pending' },
  { title: 'Организатор встреч', group: 'North Club', date: '08 сентября 2026', status: 'accepted' },
  { title: 'Дизайнер обложек', group: 'ICE Community', date: '21 августа 2026', status: 'rejected' },
]

const statusLabel: Record<Status, string> = { pending: 'На рассмотрении', accepted: 'Принята', rejected: 'Отклонена' }

function App() {
  const [view, setView] = useState<View>('catalog')
  const [scope, setScope] = useState<Scope>('all')
  const [onlyOpen, setOnlyOpen] = useState(true)
  const [selected, setSelected] = useState<Position | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [language, setLanguage] = useState<'RU' | 'EN'>('RU')
  const visiblePositions = positions.filter((position) => (scope === 'all' || (scope === 'channel' ? position.isChannel : !position.isChannel)) && (!onlyOpen || position.isOpen))

  const openForm = () => { setShowForm(true); setSubmitted(false) }
  const closeDetail = () => { setSelected(null); setShowForm(false) }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">ICE</div><div><strong>ICE Community</strong><span>Recruiting space</span></div></div>
      <div className="profile"><div className="avatar">АК</div><div><strong>Анна Ким</strong><span>@annakim</span></div><ChevronRight size={16} /></div>
      <nav className="main-nav">
        <NavItem icon={<LayoutGrid size={18} />} label="Каталог" active={view === 'catalog'} onClick={() => { setView('catalog'); closeDetail() }} />
        <NavItem icon={<Inbox size={18} />} label="Мои заявки" active={view === 'applications'} onClick={() => { setView('applications'); closeDetail() }} count="3" />
        <NavItem icon={<Settings2 size={18} />} label="Управление" active={view === 'admin'} onClick={() => { setView('admin'); closeDetail() }} />
      </nav>
      <div className="sidebar-bottom"><button className="help-button"><CircleHelp size={17} /> Помощь</button><div className="language-switch"><button className={language === 'RU' ? 'active' : ''} onClick={() => setLanguage('RU')}>RU</button><button className={language === 'EN' ? 'active' : ''} onClick={() => setLanguage('EN')}>EN</button></div></div>
    </aside>
    <main className="content">
      <header className="topbar"><button className="mobile-menu"><Menu size={20} /></button><div className="breadcrumbs"><span>ICE Community</span><ChevronRight size={14} /><strong>{view === 'catalog' ? 'Возможности' : view === 'applications' ? 'Мои заявки' : 'Панель управления'}</strong></div><div className="top-actions"><button className="icon-button"><SlidersHorizontal size={17} /></button><div className="mini-avatar">АК</div></div></header>
      {view === 'catalog' && !selected && <Catalog scope={scope} setScope={setScope} onlyOpen={onlyOpen} setOnlyOpen={setOnlyOpen} visiblePositions={visiblePositions} setSelected={setSelected} />}
      {view === 'applications' && <Applications />}
      {view === 'admin' && <Admin />}
      {selected && <PositionDetail position={selected} showForm={showForm} openForm={openForm} closeDetail={closeDetail} submitted={submitted} setSubmitted={setSubmitted} />}
    </main>
  </div>
}

function NavItem({ icon, label, active, onClick, count }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; count?: string }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{count && <em>{count}</em>}</button> }

function Catalog({ scope, setScope, onlyOpen, setOnlyOpen, visiblePositions, setSelected }: { scope: Scope; setScope: (scope: Scope) => void; onlyOpen: boolean; setOnlyOpen: (value: boolean) => void; visiblePositions: Position[]; setSelected: (position: Position) => void }) { return <div className="page"><div className="page-intro"><div><p className="eyebrow">SEPTEMBER 2026 · 06 OPEN ROLES</p><h1>Найдите свою<br /><i>точку</i> роста.</h1><p className="intro-copy">Команда, в которой идеи становятся делами.<br />Выберите роль, которая вам близка.</p></div><div className="intro-decoration"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><span>✦</span></div></div><div className="filter-bar"><div className="segmented"><button className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>Все</button><button className={scope === 'channel' ? 'active' : ''} onClick={() => setScope('channel')}>Канал</button><button className={scope === 'groups' ? 'active' : ''} onClick={() => setScope('groups')}>Группы</button></div><label className="check-filter"><input type="checkbox" checked={onlyOpen} onChange={(event) => setOnlyOpen(event.target.checked)} /><span className="fake-check"><Check size={12} /></span> Только открытые</label><span className="result-count">{visiblePositions.length} позиции</span></div><div className="role-grid">{visiblePositions.map((position) => <RoleCard key={position.id} position={position} onClick={() => setSelected(position)} />)}</div></div> }

function RoleCard({ position, onClick }: { position: Position; onClick: () => void }) { return <button className="role-card" onClick={onClick}><div className={`role-visual ${position.accent}`}><span>{position.isChannel ? 'CHANNEL' : 'GROUP'}</span><BriefcaseBusiness size={42} strokeWidth={1.2} /><div className="visual-number">0{position.id}</div></div><div className="role-body"><div className="role-meta"><span className={position.isChannel ? 'tag channel' : 'tag group'}>{position.isChannel ? 'КАНАЛ' : position.group.toUpperCase()}</span><span className={position.isOpen ? 'open-dot' : 'closed-dot'}>{position.isOpen ? 'Открыт набор' : 'Набор закрыт'}</span></div><h3>{position.title}</h3><p>{position.description}</p><div className="role-footer"><span><Users size={15} /> {position.applicants} заявок</span><span className="arrow"><ChevronRight size={18} /></span></div></div></button> }

function PositionDetail({ position, showForm, openForm, closeDetail, submitted, setSubmitted }: { position: Position; showForm: boolean; openForm: () => void; closeDetail: () => void; submitted: boolean; setSubmitted: (value: boolean) => void }) { return <div className="detail-view"><button className="back-link" onClick={closeDetail}><ArrowLeft size={16} /> Назад к каталогу</button>{showForm ? <ApplicationForm position={position} submitted={submitted} setSubmitted={setSubmitted} /> : <div className="detail-layout"><div><span className={`tag ${position.isChannel ? 'channel' : 'group'}`}>{position.isChannel ? 'ICE COMMUNITY' : position.group.toUpperCase()}</span><h1>{position.title}</h1><p className="detail-description">{position.description}</p><div className="detail-section"><h3>О роли</h3><p>Мы ищем человека, который любит доводить идеи до результата и умеет работать с людьми. В этой роли будет пространство для самостоятельности, инициативы и настоящего влияния на сообщество.</p></div><div className="detail-section"><h3>Что важно</h3><div className="pill-list"><span>Внимательность</span><span>Инициативность</span><span>2–4 часа в неделю</span></div></div></div><aside className="apply-panel"><div className="panel-icon"><FileText size={24} /></div><h3>Готовы присоединиться?</h3><p>Расскажите о себе в короткой форме. Это займёт около 3 минут.</p><button className="primary-button" onClick={openForm} disabled={!position.isOpen}>{position.isOpen ? <>Подать заявку <Send size={16} /></> : 'Набор закрыт'}</button><span className="panel-note">Заявка конфиденциальна</span></aside></div>}</div> }

function ApplicationForm({ position, submitted, setSubmitted }: { position: Position; submitted: boolean; setSubmitted: (value: boolean) => void }) { if (submitted) return <div className="success-state"><div className="success-icon"><Check size={28} /></div><p className="eyebrow">ЗАЯВКА ОТПРАВЛЕНА</p><h1>Спасибо, что<br /><i>решились.</i></h1><p>Мы посмотрим ответы и вернёмся к вам в течение 5 рабочих дней.</p><button className="secondary-button" onClick={() => setSubmitted(false)}>Изменить заявку</button></div>; return <div className="form-layout"><div><p className="eyebrow">ЗАЯВКА · {position.title.toUpperCase()}</p><h1>Расскажите<br /><i>о себе.</i></h1><p className="intro-copy">Не нужно быть идеальным. Нам важно понять, что вам интересно.</p></div><form className="application-form" onSubmit={(event) => { event.preventDefault(); localStorage.setItem('ice-submission', JSON.stringify({ title: position.title, group: position.group, date: new Date().toLocaleDateString('ru-RU'), status: 'pending' })); setSubmitted(true) }}><label>Как к вам обращаться?<input required placeholder="Ваше имя" /></label><label>Почему вам интересна эта роль?<textarea required placeholder="Пара предложений о вашей мотивации" rows={4} /></label><label>Есть что добавить? <span className="optional">необязательно</span><textarea placeholder="Ссылки, опыт, идеи" rows={3} /></label><label className="file-label"><span>Резюме или портфолио <span className="optional">необязательно</span></span><span className="file-drop"><Paperclip size={17} /> Прикрепить файл<input type="file" /></span></label><button className="primary-button" type="submit">Отправить заявку <Send size={16} /></button></form></div> }

function Applications() { const [items, setItems] = useState(submissions); useEffect(() => { const saved = localStorage.getItem('ice-submission'); if (saved) setItems([JSON.parse(saved), ...submissions.filter((item) => item.title !== JSON.parse(saved).title)]) }, []); return <div className="page inner-page"><div className="section-heading"><div><p className="eyebrow">ЛИЧНЫЙ РАЗДЕЛ</p><h1>Мои заявки.</h1></div><span className="heading-count">{String(items.length).padStart(2, '0')} всего</span></div><div className="application-list">{items.map((item) => <div className="application-row" key={`${item.title}-${item.date}`}><div className="application-symbol"><FileText size={21} /></div><div className="application-info"><h3>{item.title}</h3><span>{item.group} · {item.date}</span></div><span className={`status ${item.status}`}>{statusLabel[item.status]}</span><ChevronRight size={18} className="row-arrow" /></div>)}</div></div> }

function Admin() { const [adminTab, setAdminTab] = useState('positions'); return <div className="page inner-page"><div className="section-heading"><div><p className="eyebrow">ADMIN WORKSPACE</p><h1>Управление.</h1></div><button className="primary-button small"><Plus size={16} /> Добавить</button></div><div className="admin-tabs"><button className={adminTab === 'positions' ? 'active' : ''} onClick={() => setAdminTab('positions')}>Должности <span>6</span></button><button className={adminTab === 'groups' ? 'active' : ''} onClick={() => setAdminTab('groups')}>Группы <span>3</span></button><button className={adminTab === 'applications' ? 'active' : ''} onClick={() => setAdminTab('applications')}>Заявки <span>28</span></button></div>{adminTab === 'positions' ? <div className="admin-table"><div className="table-head"><span>ДОЛЖНОСТЬ</span><span>ГРУППА</span><span>СТАТУС</span><span>ЗАЯВКИ</span><span /></div>{positions.map((item) => <div className="table-row" key={item.id}><div><strong>{item.title}</strong><span>Обновлено сегодня</span></div><span>{item.group}</span><span className={item.isOpen ? 'table-open' : 'table-closed'}>{item.isOpen ? 'Открыт' : 'Закрыт'}</span><span>{item.applicants}</span><button className="more-button"><Menu size={17} /></button></div>)}</div> : <div className="empty-admin"><Users size={30} /><h3>{adminTab === 'groups' ? 'Группы сообщества' : 'Входящие заявки'}</h3><p>Раздел готов к работе с API.</p></div>}</div> }

export default App
