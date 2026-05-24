// ===== Tasks management =====
const { useState: useStateTask } = React;

function TasksScreen({ pushToast }) {
  const { tasks: initialTasks } = KPO;
  const [tasks, setTasks] = useStateTask(initialTasks);
  const [showAssign, setShowAssign] = useStateTask(false);

  const pending = tasks.filter(t=>t.status==='pending');
  const done = tasks.filter(t=>t.status==='done');

  const markDone = (id) => {
    setTasks(tasks.map(t=>t.id===id?{...t,status:'done',proof:true}:t));
    const t = tasks.find(x=>x.id===id);
    pushToast && pushToast({ title:`${t.staff} menyelesaikan tugas`, body: t.judul });
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div className="grid-3">
        <div className="kpi"><span className="kpi-label">Aktif</span><div className="kpi-value num">{pending.length}</div><span style={{fontSize:11,color:'var(--ink-mute)'}}>Belum selesai</span></div>
        <div className="kpi"><span className="kpi-label">Selesai hari ini</span><div className="kpi-value num" style={{color:'var(--positive)'}}>{done.length}</div><span style={{fontSize:11,color:'var(--ink-mute)'}}>Dengan bukti upload</span></div>
        <div className="kpi"><span className="kpi-label">Deadline hari ini</span><div className="kpi-value num" style={{color:'var(--warn)'}}>3</div><span style={{fontSize:11,color:'var(--ink-mute)'}}>Sabtu, 24 Mei</span></div>
      </div>

      <div style={{display:'flex',alignItems:'center'}}>
        <div className="section-head" style={{margin:0}}>
          <h2>Pending</h2>
          <span className="meta">{pending.length} tugas aktif</span>
        </div>
        <button className="btn btn-primary" style={{marginLeft:'auto'}} onClick={()=>setShowAssign(true)}><Icon name="plus" size={14}/> Assign Tugas</button>
      </div>

      <div className="grid-3">
        {pending.map(t => (
          <div key={t.id} className="card" style={{padding:0,display:'flex',flexDirection:'column'}}>
            <div style={{padding:'14px 16px 10px',borderBottom:'1px solid var(--line)'}}>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                <span className="chip pending"><span className="chip-dot"/>Pending</span>
                <span style={{fontSize:11,color:'var(--ink-mute)',marginLeft:'auto'}} className="num"><Icon name="calendar" size={11}/> {fmtDate(t.deadline)}</span>
              </div>
              <div style={{fontSize:14,lineHeight:1.4}}>{t.judul}</div>
              {t.catatan && <div style={{fontSize:11.5,color:'var(--ink-mute)',marginTop:6,lineHeight:1.5}}>{t.catatan}</div>}
            </div>
            <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:8}}>
              <div className="avatar" style={{width:22,height:22,fontSize:10}}>{t.staff[0]}</div>
              <span style={{fontSize:12}}>{t.staff}</span>
              <button className="btn btn-sm" style={{marginLeft:'auto'}} onClick={()=>markDone(t.id)}><Icon name="check" size={12}/> Tandai Selesai</button>
            </div>
          </div>
        ))}
      </div>

      <div className="section-head" style={{marginTop:6}}>
        <h2>Selesai</h2>
        <span className="meta">{done.length} dengan bukti</span>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <table className="tbl">
          <thead><tr><th>Tugas</th><th>Staff</th><th>Deadline</th><th>Bukti</th><th>Status</th></tr></thead>
          <tbody>
            {done.map(t => (
              <tr key={t.id}>
                <td>
                  <div>{t.judul}</div>
                  {t.catatan && <div style={{fontSize:11,color:'var(--ink-mute)',marginTop:2}}>{t.catatan}</div>}
                </td>
                <td>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <div className="avatar" style={{width:24,height:24,fontSize:10}}>{t.staff[0]}</div>
                    <span style={{fontSize:13}}>{t.staff}</span>
                  </div>
                </td>
                <td className="num" style={{color:'var(--ink-mute)'}}>{fmtDate(t.deadline)}</td>
                <td>
                  {t.proof ? <span className="chip" style={{color:'var(--positive)'}}><Icon name="image" size={10}/> 2 foto</span> : <span className="chip">—</span>}
                </td>
                <td><span className="chip done"><span className="chip-dot"/>Done</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAssign && <AssignTaskModal onClose={()=>setShowAssign(false)} onSave={(t)=>{ setTasks([{...t,id:'t'+Date.now(),status:'pending'},...tasks]); setShowAssign(false); pushToast && pushToast({title:'Tugas baru', body:t.judul+' → '+t.staff}); }}/>}
    </div>
  );
}

function AssignTaskModal({ onClose, onSave }) {
  const [judul, setJudul] = useStateTask('');
  const [staff, setStaff] = useStateTask('Hardi');
  const [deadline, setDeadline] = useStateTask('2026-05-25');
  const [catatan, setCatatan] = useStateTask('');

  return (
    <div className="scrim" onClick={(e)=>e.target.classList.contains('scrim')&&onClose()}>
      <div className="modal" style={{width:520}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center'}}>
          <div>
            <div className="card-sub">Task Management</div>
            <div className="font-serif" style={{fontSize:20}}>Assign tugas baru</div>
          </div>
          <button className="btn btn-icon btn-ghost" style={{marginLeft:'auto'}} onClick={onClose}><Icon name="close" size={14}/></button>
        </div>
        <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
          <div className="field"><label className="field-label">Judul tugas</label><input className="input" placeholder="Kerjakan pesanan INV-…" value={judul} onChange={e=>setJudul(e.target.value)}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div className="field"><label className="field-label">Assign ke</label>
              <select className="select" value={staff} onChange={e=>setStaff(e.target.value)}>
                <option>Hardi</option><option>Yuni</option><option>Beni</option>
              </select>
            </div>
            <div className="field"><label className="field-label">Deadline</label><input className="input" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></div>
          </div>
          <div className="field"><label className="field-label">Catatan</label><textarea className="textarea" value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Instruksi untuk staff…"/></div>
        </div>
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--line)',display:'flex',gap:8}}>
          <button className="btn" style={{marginLeft:'auto'}} onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={()=>onSave({judul,staff,deadline,catatan})}><Icon name="check" size={14}/> Assign</button>
        </div>
      </div>
    </div>
  );
}

window.TasksScreen = TasksScreen;
