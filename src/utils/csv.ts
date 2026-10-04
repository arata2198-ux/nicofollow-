import { NicoUser, ScanResult } from '../types/niconico';

export function exportUsersToCsv(
  users: NicoUser[],
  categoryName: string,
  targetAccountName: string
) {
  const header = ['ユーザーID', 'ニックネーム', 'プレミアム会員', 'プロフィール説明', 'URL'];

  const rows = users.map((u) => {
    const desc = (u.strippedDescription || u.description || '').replace(/"/g, '""');
    const isPrem = u.isPremium ? 'プレミアム' : '一般';
    const profileUrl = `https://www.nicovideo.jp/user/${u.id}`;
    return [u.id, `"${u.nickname.replace(/"/g, '""')}"`, isPrem, `"${desc}"`, profileUrl].join(
      ','
    );
  });

  // UTF-8 BOM for Japanese Excel compatibility
  const bom = '\uFEFF';
  const csvContent = bom + [header.join(','), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `nicovideo_${targetAccountName}_${categoryName}_${dateStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFullReportToJson(result: ScanResult) {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(result, null, 2));
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  link.setAttribute('href', dataStr);
  link.setAttribute(
    'download',
    `nicovideo_${result.user.nickname}_scan_report_${dateStr}.json`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
