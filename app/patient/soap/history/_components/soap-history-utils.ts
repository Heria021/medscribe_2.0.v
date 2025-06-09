export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getQualityColor = (score?: number) => {
  if (!score) return 'bg-muted text-muted-foreground border-border';
  if (score >= 90) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-400/20';
  if (score >= 80) return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-400/20';
  if (score >= 70) return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-400/20';
  return 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:border-red-400/20';
};

export const filterNotes = (notes: any[], searchTerm: string) => {
  return notes
    .filter(note =>
      searchTerm === "" ||
      note.subjective.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.assessment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.plan.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const calculateStats = (notes: any[], sharedNotes: any[]) => {
  const totalNotes = notes.length;
  const sharedCount = sharedNotes.length;
  const avgQuality = totalNotes > 0
    ? Math.round(notes.reduce((acc, note) => acc + (note.qualityScore || 0), 0) / totalNotes)
    : 0;
  const recentNotes = notes.filter(note =>
    Date.now() - note.createdAt < 7 * 24 * 60 * 60 * 1000
  ).length;

  return { totalNotes, sharedCount, avgQuality, recentNotes };
};

export const createSharedNotesMap = (sharedNotes: any[]) => {
  const sharedNotesMap = new Map();
  (sharedNotes || []).forEach(shared => {
    if (!sharedNotesMap.has(shared.soapNoteId)) {
      sharedNotesMap.set(shared.soapNoteId, []);
    }
    sharedNotesMap.get(shared.soapNoteId).push(shared);
  });
  return sharedNotesMap;
};

export const downloadNote = (note: any) => {
  const content = `
SOAP NOTES
Generated on: ${formatDate(note.createdAt)}
${note.qualityScore ? `Quality Score: ${note.qualityScore}%` : ''}
${note.processingTime ? `Processing Time: ${note.processingTime}` : ''}

SUBJECTIVE:
${note.subjective}

OBJECTIVE:
${note.objective}

ASSESSMENT:
${note.assessment}

PLAN:
${note.plan}
${note.recommendations ? `\n\nRECOMMENDATIONS:\n${note.recommendations.join('\n')}` : ''}
  `.trim();

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SOAP_Note_${new Date(note.createdAt).toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
