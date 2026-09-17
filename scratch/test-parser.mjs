const raw = `Lead_ID	Full_Name	Email_ID	Mobile_Number	Job_Role	Years_of_Experience	Notice_Period
1	Vaishnavi Borkar	vaishnaviborkar03@gmail.com	919130972967	Software Testing	4y 5m	15 Days or less
2	Sudarshan Suresh Mali	sudarshanmali703@gmail.com	919146848703	Software Testing	3y 1m	1 Month
3	Rushikesh Patil	rushikeshp9890@gmail.com	919890912747	Software Testing	3y 6m	Serving Notice Period`;

const lines = raw.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
const firstLine = lines[0];
const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(',') ? ',' : ';';
const headerCols = firstLine.split(delimiter).map(c => c.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''));

let nameIdx = headerCols.findIndex(c => c.includes('full_name') || c === 'name');
let emailIdx = headerCols.findIndex(c => c.includes('email') || c.includes('mail'));
let mobileIdx = headerCols.findIndex(c => c.includes('mobile') || c.includes('phone'));
let roleIdx = headerCols.findIndex(c => c.includes('job_role') || c.includes('role'));
let expIdx = headerCols.findIndex(c => c.includes('experience') || c.includes('exp'));
let noticeIdx = headerCols.findIndex(c => c.includes('notice'));

console.log('Detected column indices:', { nameIdx, emailIdx, mobileIdx, roleIdx, expIdx, noticeIdx });

for (const line of lines.slice(1)) {
  const parts = line.split(delimiter).map(p => p.trim());
  console.log({
    full_name: parts[nameIdx],
    email: parts[emailIdx],
    mobile: parts[mobileIdx],
    job_role: parts[roleIdx],
    years_of_experience: parts[expIdx],
    notice_period: parts[noticeIdx]
  });
}
