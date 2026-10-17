"""Copy only V1's real GLSL source; V1 is read-only. No dependency or asset copying."""
from pathlib import Path
import hashlib, json, re

root = Path(__file__).resolve().parents[1]
v1 = Path('C:/Users/hashe/Desktop/site')
source = v1 / 'components/ui/global-burgundy-warp-background.tsx'
text = source.read_text(encoding='utf-8')
fragment = re.search(r'const fragmentShaderSource = `([\s\S]*?)`;',text).group(1)
output = root / 'preview/v1-warp-shader.ts'
if output.exists(): raise SystemExit('Refusing to overwrite an existing source module')
digest = hashlib.sha256(fragment.encode()).hexdigest()
output.write_text('// Verbatim V1 GLSL, recovered 13 October 2026. See docs/design/V1-SMOKE-PROVENANCE.md.\n'
    + f'// Original fragment SHA-256: {digest}\n'
    + 'export const V1_FRAGMENT_SHADER = `'+fragment+'`;\n\n'
    + '// Keep all geometry, five-octave noise and color-blending equations intact.\n'
    + '// Light paper has no dark vignette or additive grain. Palette is supplied as uniforms.\n'
    + "export const V1_EDITORIAL_FRAGMENT_SHADER = V1_FRAGMENT_SHADER.replace(\n"
    + "  /  float vignette = smoothstep\\(1\\.05, 0\\.18, radial\\);[\\s\\S]*?color \\+= 0\\.018 \\* noise\\(gl_FragCoord\\.xy \\* 0\\.42 \\+ u_time\\);/,\n"
    + "  '  // Editorial finish: retain paper luminance and the original pigment folds.',\n);\n", encoding='utf-8')
report={'source':str(source),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'fragment_sha256':digest,'v1_source_hashes':{str(p.relative_to(v1)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in [source,v1/'components/ui/burgundy-warp-runtime.ts']},'output':str(output),'adaptation':'Exact GLSL copied; omit dark vignette and additive screen-space grain for editorial variant only. Supply existing brand ramp as uniforms.'}
(root/'output/playwright/design-intelligence/v1-provenance.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
