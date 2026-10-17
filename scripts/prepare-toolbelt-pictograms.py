"""Pinned, inert local images for concepts without product branding.

Keep existing brand assets byte-identical; extend their provenance manifest.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen
import hashlib
import json
import xml.etree.ElementTree as ET

target = Path(__file__).resolve().parents[1] / 'public/v2-icons'
revision = '1bf90d5ff118bc6690120ff9fdfe234565b7e414'
base = f'https://raw.githubusercontent.com/icons8/flat-color-icons/{revision}/'
concepts = {
    'devices': 'multiple_devices', 'cross-platform': 'workflow',
    'desktop': 'display', 'api': 'flow_chart', 'database': 'database',
    'socket': 'synchronize', 'nfc': 'nfc_sign', 'wifi': 'wi-fi_logo',
    'realtime': 'electricity', 'pcb': 'circuit', 'hardware': 'electronics',
    'vision': 'camera_identification', 'email': 'feedback',
    'spreadsheet': 'data_sheet', 'client-server': 'org_unit',
    'datagrams': 'multiple_inputs', 'led': 'idea',
    'sensors': 'electrical_sensor', 'integration': 'deployment',
    'chart': 'line_chart', 'detection': 'inspection',
    'tracking': 'radar_plot', 'games': 'puzzle',
}
sources = [
    (f'toolbelt-{name}', base + f'svg/{icon}.svg', 'Icons8 Flat Color Icons MIT', '')
    for name, icon in concepts.items()
]
sources.append(('toolbelt-bluetooth',
    'https://raw.githubusercontent.com/simple-icons/simple-icons/13.21.0/icons/bluetooth.svg',
    'Simple Icons CC0-1.0', 'Bluetooth blue #0082FC applied to the original symbol'))

def fetch(source):
    name, url, license_name, modification = source
    data = urlopen(url, timeout=30).read()
    original_hash = hashlib.sha256(data).hexdigest()
    if b'<!ENTITY' in data.upper():
        raise ValueError('Unsafe XML entity declaration: ' + name)
    if b'<!DOCTYPE' in data.upper():
        # Legacy artwork includes an Illustrator external DTD; never ship it.
        data = data[data.index(b'<svg'):]
        modification = 'XML preamble/external DTD removed'
    svg = ET.fromstring(data)
    if not svg.tag.endswith('svg') or 'viewBox' not in svg.attrib:
        raise ValueError('Missing SVG viewBox: ' + name)
    for node in svg.iter():
        if node.tag.rsplit('}', 1)[-1] in {'script', 'foreignObject', 'image'}:
            raise ValueError('Active SVG content: ' + name)
        for key, value in node.attrib.items():
            if key.lower().startswith('on') or (key.rsplit('}', 1)[-1] == 'href' and not value.startswith('#')):
                raise ValueError('External SVG reference: ' + name)
    if name == 'toolbelt-bluetooth':
        data = data.replace(b'<svg ', b'<svg fill="#0082FC" ', 1)
    (target / (name + '.svg')).write_bytes(data)
    return {'name': name, 'source': url, 'license': license_name,
            'kind': 'symbol' if name == 'toolbelt-bluetooth' else 'concept pictogram',
            'modification': modification, 'sourceSha256': original_hash,
            'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=6) as pool:
        records = list(pool.map(fetch, sources))
    (target / 'FLAT-COLOR-ICONS-LICENSE.txt').write_bytes(urlopen(base + 'LICENSE.md', timeout=30).read())
    manifest = target / 'SOURCES.json'
    previous = json.loads(manifest.read_text(encoding='utf-8'))
    names = {item['name'] for item in records}
    manifest.write_text(json.dumps([item for item in previous if item['name'] not in names] + records, indent=2), encoding='utf-8')
    print(json.dumps({'added': len(records), 'bytes': sum(item['bytes'] for item in records), 'validated': True}))
