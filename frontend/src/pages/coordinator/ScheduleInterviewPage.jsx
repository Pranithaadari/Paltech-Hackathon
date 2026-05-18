// import React, { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import api from "../../utils/api";

// export default function ScheduleInterviewPage() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [candidates, setCandidates] = useState([]);
//   const [interviewers, setInterviewers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [rounds, setRounds] = useState([]);
//   const [form, setForm] = useState({
//     candidateId: searchParams.get("candidateId") || "",
//     roundId: "",
//     interviewerId: "",
//     scheduledAt: "",
//     durationMinutes: 60,
//     meetingLink: "",
//   });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     Promise.all([
//       api.get("/candidates"),
//       api.get("/dashboard/interviewers"),
//       api.get("/roles"),
//     ]).then(([c, i, r]) => {
//       setCandidates(c.data);
//       setInterviewers(i.data);
//       setRoles(r.data);
//     }).finally(() => setLoading(false));
//   }, []);

//   // Load rounds when candidate changes
//   useEffect(() => {
//     if (!form.candidateId) return setRounds([]);
//     const candidate = candidates.find((c) => c.id === +form.candidateId);
//     if (!candidate) return;
//     api.get(`/roles/${candidate.roleId}`).then((r) => setRounds(r.data.rounds || []));
//   }, [form.candidateId, candidates]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.candidateId || !form.roundId || !form.interviewerId || !form.scheduledAt)
//       return setError("All required fields must be filled");
//     setSaving(true);
//     setError("");
//     try {
//       await api.post("/interviews", {
//         ...form,
//         candidateId: +form.candidateId,
//         roundId: +form.roundId,
//         interviewerId: +form.interviewerId,
//         durationMinutes: +form.durationMinutes,
//       });
//       setSuccess("Interview scheduled successfully!");
//       setTimeout(() => navigate("/coordinator"), 1500);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to schedule interview");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <div className="loading-center"><div className="spinner" /></div>;

//   return (
//     <div className="page">
//       <div className="page-header">
//         <div>
//           <div className="page-title">Schedule Interview</div>
//           <div className="page-subtitle">Set up a new interview session</div>
//         </div>
//       </div>
//       <div className="card" style={{ maxWidth: 600 }}>
//         <div className="card-header"><span className="card-title">Interview Details</span></div>
//         <div className="card-body">
//           {error && <div className="alert alert-error">{error}</div>}
//           {success && <div className="alert alert-success">{success}</div>}
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label className="form-label">Candidate *</label>
//               <select className="form-select" value={form.candidateId}
//                 onChange={(e) => setForm({ ...form, candidateId: e.target.value, roundId: "" })} required>
//                 <option value="">Select candidate...</option>
//                 {candidates.filter((c) => !["hired","rejected"].includes(c.status)).map((c) => (
//                   <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="form-group">
//               <label className="form-label">Round *</label>
//               <select className="form-select" value={form.roundId}
//                 onChange={(e) => setForm({ ...form, roundId: e.target.value })}
//                 disabled={!form.candidateId} required>
//                 <option value="">Select round...</option>
//                 {rounds.map((r) => <option key={r.id} value={r.id}>Round {r.order}: {r.name}</option>)}
//               </select>
//               {!form.candidateId && <div className="form-hint">Select a candidate first</div>}
//             </div>
//             <div className="form-group">
//               <label className="form-label">Interviewer *</label>
//               <select className="form-select" value={form.interviewerId}
//                 onChange={(e) => setForm({ ...form, interviewerId: e.target.value })} required>
//                 <option value="">Select interviewer...</option>
//                 {interviewers.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
//               </select>
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label className="form-label">Date & Time *</label>
//                 <input className="form-input" type="datetime-local" value={form.scheduledAt}
//                   onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Duration (minutes)</label>
//                 <input className="form-input" type="number" min="15" max="240" step="15"
//                   value={form.durationMinutes}
//                   onChange={(e) => setForm({ ...form, durationMinutes: +e.target.value })} />
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="form-label">Meeting Link</label>
//               <input className="form-input" type="url" placeholder="https://meet.google.com/..."
//                 value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
//             </div>
//             <div className="modal-footer" style={{ padding: 0, paddingTop: 8 }}>
//               <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
//               <button type="submit" className="btn btn-primary" disabled={saving}>
//                 {saving ? "Scheduling..." : "Schedule Interview"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import api from "../../utils/api";

// export default function ScheduleInterviewPage() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [candidates, setCandidates] = useState([]);
//   const [interviewers, setInterviewers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [rounds, setRounds] = useState([]);
//   const [form, setForm] = useState({
//     candidateId: searchParams.get("candidateId") || "",
//     roundId: "",
//     interviewerId: "",
//     scheduledAt: "",
//     durationMinutes: 60,
//     meetingLink: "",
//   });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     Promise.all([
//       api.get("/candidates"),
//       api.get("/dashboard/interviewers"),
//       api.get("/roles"),
//     ]).then(([c, i, r]) => {
//       setCandidates(c.data);
//       setInterviewers(i.data);
//       setRoles(r.data);
//     }).finally(() => setLoading(false));
//   }, []);

//   // Load rounds when candidate changes
//   useEffect(() => {
//     if (!form.candidateId) return setRounds([]);
//     const candidate = candidates.find((c) => c.id === +form.candidateId);
//     if (!candidate) return;
//     api.get(`/roles/${candidate.roleId}`).then((r) => setRounds(r.data.rounds || []));
//   }, [form.candidateId, candidates]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.candidateId || !form.roundId || !form.interviewerId || !form.scheduledAt)
//       return setError("All required fields must be filled");

//     // Block past date/time on submit
//     if (new Date(form.scheduledAt) <= new Date())
//       return setError("Interview time must be in the future");

//     setSaving(true);
//     setError("");
//     try {
//       await api.post("/interviews", {
//         ...form,
//         candidateId: +form.candidateId,
//         roundId: +form.roundId,
//         interviewerId: +form.interviewerId,
//         durationMinutes: +form.durationMinutes,
//       });
//       setSuccess("Interview scheduled successfully!");
//       setTimeout(() => navigate("/coordinator"), 1500);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to schedule interview");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ✅ Build current local datetime string (IST safe - no UTC conversion)
//   const now = new Date();
//   const pad = (n) => String(n).padStart(2, "0");
//   const todayDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
//   const todayLocal = `${todayDate}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

//   // ✅ KEY FIX:
//   // - Today selected → min = current time (blocks past times)
//   // - Tomorrow or future → min = 00:00 of that date (full 24hrs allowed)
//   const selectedDate = form.scheduledAt?.slice(0, 10);
//   const minDateTime = selectedDate && selectedDate > todayDate
//     ? `${selectedDate}T00:00`
//     : todayLocal;

//   // Filter rounds based on candidate's current round
//   const selectedCandidate = candidates.find((c) => c.id === +form.candidateId);
//   const currentRound = rounds.find((r) => r.id === selectedCandidate?.currentRoundId);
//   const currentRoundOrder = currentRound ? currentRound.order + 1 : 1;
//   const availableRounds = rounds.filter((r) => r.order >= currentRoundOrder);

//   if (loading) return <div className="loading-center"><div className="spinner" /></div>;

//   return (
//     <div className="page">
//       <div className="page-header">
//         <div>
//           <div className="page-title">Schedule Interview</div>
//           <div className="page-subtitle">Set up a new interview session</div>
//         </div>
//       </div>
//       <div className="card" style={{ maxWidth: 600 }}>
//         <div className="card-header"><span className="card-title">Interview Details</span></div>
//         <div className="card-body">
//           {error && <div className="alert alert-error">{error}</div>}
//           {success && <div className="alert alert-success">{success}</div>}
//           <form onSubmit={handleSubmit}>

//             <div className="form-group">
//               <label className="form-label">Candidate *</label>
//               <select className="form-select" value={form.candidateId}
//                 onChange={(e) => setForm({ ...form, candidateId: e.target.value, roundId: "" })} required>
//                 <option value="">Select candidate...</option>
//                 {candidates.filter((c) => !["hired", "rejected"].includes(c.status)).map((c) => (
//                   <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Round *</label>
//               <select className="form-select" value={form.roundId}
//                 onChange={(e) => setForm({ ...form, roundId: e.target.value })}
//                 disabled={!form.candidateId} required>
//                 <option value="">Select round...</option>
//                 {availableRounds.map((r) => (
//                   <option key={r.id} value={r.id}>Round {r.order}: {r.name}</option>
//                 ))}
//               </select>
//               {!form.candidateId && (
//                 <div className="form-hint">Select a candidate first</div>
//               )}
//               {form.candidateId && currentRound && (
//                 <div className="form-hint">
//                   ✓ Round {currentRound.order} ({currentRound.name}) already completed
//                 </div>
//               )}
//             </div>

//             <div className="form-group">
//               <label className="form-label">Interviewer *</label>
//               <select className="form-select" value={form.interviewerId}
//                 onChange={(e) => setForm({ ...form, interviewerId: e.target.value })} required>
//                 <option value="">Select interviewer...</option>
//                 {interviewers.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
//               </select>
//             </div>

//             <div className="form-row">
//               <div className="form-group">
//                 <label className="form-label">Date & Time *</label>
//                 {/* ✅ FIXED: today = current time onwards, future date = full 24hrs */}
//                 <input
//                   className="form-input"
//                   type="datetime-local"
//                   value={form.scheduledAt}
//                   onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
//                   min={minDateTime}
//                   required
//                 />
//                 <div className="form-hint">
//                   {selectedDate && selectedDate > todayDate
//                     ? "All times available for future date"
//                     : "Only current time and future allowed for today"}
//                 </div>
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Duration (minutes)</label>
//                 <input className="form-input" type="number" min="15" max="240" step="15"
//                   value={form.durationMinutes}
//                   onChange={(e) => setForm({ ...form, durationMinutes: +e.target.value })} />
//               </div>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Meeting Link</label>
//               <input className="form-input" type="url" placeholder="https://meet.google.com/..."
//                 value={form.meetingLink}
//                 onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
//             </div>

//             <div className="modal-footer" style={{ padding: 0, paddingTop: 8 }}>
//               <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
//               <button type="submit" className="btn btn-primary" disabled={saving}>
//                 {saving ? "Scheduling..." : "Schedule Interview"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api";

export default function ScheduleInterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [form, setForm] = useState({
    candidateId: searchParams.get("candidateId") || "",
    roundId: "",
    interviewerId: "",
    scheduledAt: "",
    durationMinutes: 60,
    meetingLink: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/candidates"),
      api.get("/dashboard/interviewers"),
      api.get("/roles"),
    ]).then(([c, i, r]) => {
      setCandidates(c.data);
      setInterviewers(i.data);
      setRoles(r.data);
    }).finally(() => setLoading(false));
  }, []);

  // Load rounds when candidate changes
  useEffect(() => {
    if (!form.candidateId) return setRounds([]);
    const candidate = candidates.find((c) => c.id === +form.candidateId);
    if (!candidate) return;
    api.get(`/roles/${candidate.roleId}`).then((r) => setRounds(r.data.rounds || []));
  }, [form.candidateId, candidates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.candidateId || !form.roundId || !form.interviewerId || !form.scheduledAt)
      return setError("All required fields must be filled");

    // ✅ CHANGE 2: 5-minute buffer so current-minute selection doesn't fail on submit
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (new Date(form.scheduledAt) < fiveMinutesFromNow)
      return setError("Please schedule at least 5 minutes from now");

    setSaving(true);
    setError("");
    try {
      await api.post("/interviews", {
        ...form,
        candidateId: +form.candidateId,
        roundId: +form.roundId,
        interviewerId: +form.interviewerId,
        durationMinutes: +form.durationMinutes,
      });
      setSuccess("Interview scheduled successfully!");
      setTimeout(() => navigate("/coordinator"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to schedule interview");
    } finally {
      setSaving(false);
    }
  };

  // ✅ CHANGE 1: Dynamically recomputes every render so minutes tick in real time (IST safe)
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const todayLocal = `${todayDate}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // If user picks today → block past hours & minutes dynamically
  // If user picks tomorrow or future → unlock full 24hrs (00:00)
  const selectedDate = form.scheduledAt?.slice(0, 10);
  const minDateTime = selectedDate && selectedDate > todayDate
    ? `${selectedDate}T00:00`   // future date → full 24 hours
    : todayLocal;               // today → current hour:minute right now

  // Filter rounds — only show rounds after candidate's completed round
  const selectedCandidate = candidates.find((c) => c.id === +form.candidateId);
  const currentRound = rounds.find((r) => r.id === selectedCandidate?.currentRoundId);
  const currentRoundOrder = currentRound ? currentRound.order + 1 : 1;
  const availableRounds = rounds.filter((r) => r.order >= currentRoundOrder);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Schedule Interview</div>
          <div className="page-subtitle">Set up a new interview session</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-header"><span className="card-title">Interview Details</span></div>
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Candidate *</label>
              <select
                className="form-select"
                value={form.candidateId}
                onChange={(e) => setForm({ ...form, candidateId: e.target.value, roundId: "" })}
                required
              >
                <option value="">Select candidate...</option>
                {candidates.filter((c) => !["hired", "rejected"].includes(c.status)).map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Round *</label>
              <select
                className="form-select"
                value={form.roundId}
                onChange={(e) => setForm({ ...form, roundId: e.target.value })}
                disabled={!form.candidateId}
                required
              >
                <option value="">Select round...</option>
                {availableRounds.map((r) => (
                  <option key={r.id} value={r.id}>Round {r.order}: {r.name}</option>
                ))}
              </select>
              {!form.candidateId && (
                <div className="form-hint">Select a candidate first</div>
              )}
              {form.candidateId && currentRound && (
                <div className="form-hint">
                  ✓ Round {currentRound.order} ({currentRound.name}) already completed
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Interviewer *</label>
              <select
                className="form-select"
                value={form.interviewerId}
                onChange={(e) => setForm({ ...form, interviewerId: e.target.value })}
                required
              >
                <option value="">Select interviewer...</option>
                {interviewers.map((i) => (
                  <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date & Time *</label>

                {/* ✅ CHANGE 1: min updates dynamically on every render
                    - Today selected → min = exact current hour:minute (IST correct)
                    - Future date    → min = 00:00 (full 24hrs unlocked)          */}
                <input
                  className="form-input"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  min={minDateTime}
                  required
                />

                {/* ✅ CHANGE 3: hint text reflects which rule is currently active */}
                <div className="form-hint">
                  {selectedDate && selectedDate > todayDate
                    ? "✓ All 24 hours available for future date"
                    : "⏰ Today: only current time + 5 mins or later allowed"}
                </div>

              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input
                  className="form-input"
                  type="number"
                  min="15"
                  max="240"
                  step="15"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: +e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Meeting Link</label>
              <input
                className="form-input"
                type="url"
                placeholder="https://meet.google.com/..."
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: 0, paddingTop: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Scheduling..." : "Schedule Interview"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}