"""检查维护时常见的缺文件、重复 ID 和空链接；不联网、不修改任何文件。"""
from pathlib import Path
from html.parser import HTMLParser
import json
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'content.js').read_text()
data=json.loads(s[s.index('{'):].rstrip(';\n'))
errors=[]
def check_path(path):
 if not (ROOT/path).is_file(): errors.append('缺少资源: '+path)
class Page(HTMLParser):
 def __init__(self): super().__init__(); self.ids=set();self.anchors=[]
 def handle_starttag(self, tag, attrs):
  attrs=dict(attrs)
  if 'id' in attrs:
   if attrs['id'] in self.ids:errors.append('重复 HTML ID: '+attrs['id'])
   self.ids.add(attrs['id'])
  for key in ('href','src'):
   path=attrs.get(key,'')
   if path.startswith('#'): self.anchors.append(path[1:])
   elif path and ':' not in path:check_path(path)
page=Page();page.feed((ROOT/'index.html').read_text())
for anchor in page.anchors:
 if anchor not in page.ids:errors.append('缺少锚点: '+anchor)
for lang in ['zh','en']:
 body=data.get(lang)
 if not body:continue
 check_path(body['profile']['avatar'])
 ids=set()
 for item in body['papers']+body['projects']:
  if item['id'] in ids:errors.append('重复内容 ID: '+item['id'])
  ids.add(item['id'])
  if not item['title'].strip():errors.append('空标题')
  media=item.get('media')
  if isinstance(media,str):check_path('assets/media/'+media+'.mp4');check_path('assets/media/'+media+'.webp')
  elif media:
   check_path(media['src'])
   if media.get('poster'):check_path(media['poster'])
  for name,url in item.get('links',{}).items():
   if url.startswith('assets/'):
    check_path(url)
   elif not url.startswith('https://'):errors.append(f'链接格式异常: {item["id"]} {name}')
 if lang=='zh':print(f'中文版：{len(body["papers"])} 篇论文/报告，{len(body["projects"])} 项项目')
if data['settings']['englishReady'] and not data.get('en'):errors.append('英文已开启但无英文数据')
if errors:
 print('\n'.join(errors));raise SystemExit(1)
print('检查通过：本地资源、数据 ID、内部锚点和链接格式。外部链接可访问性需另外验证。')
