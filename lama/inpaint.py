import numpy as np
import torch
from PIL import Image

img = Image.open('lama/input.jpg').convert('RGB')
a = np.asarray(img).astype(np.float32)
h, w, _ = a.shape  # 1786 x 1300
cream = np.array([245, 240, 234], np.float32)

E = 150
W2 = w + E
canvas = np.tile(cream, (h, W2, 1)).astype(np.float32)
canvas[:, :w] = a

model = torch.jit.load('big-lama.pt', map_location='cpu')
model.eval()

def pad8(x):
    ph = (8 - x.shape[-2] % 8) % 8
    pw = (8 - x.shape[-1] % 8) % 8
    return torch.nn.functional.pad(x, (0, pw, 0, ph), mode='reflect')

def inpaint_window(canvas, mask, y0, x0):
    win = canvas[y0:, x0:]
    mwin = mask[y0:, x0:]
    im_t = torch.from_numpy(win.transpose(2, 0, 1) / 255.0).unsqueeze(0).float()
    mk_t = torch.from_numpy(mwin).unsqueeze(0).unsqueeze(0).float()
    H0, W0 = im_t.shape[-2:]
    im_t, mk_t = pad8(im_t), pad8(mk_t)
    mk_t = (mk_t > 0).float()
    with torch.inference_mode():
        out = model(im_t, mk_t)
    res = out[0].permute(1, 2, 0).numpy()[:H0, :W0] * 255.0
    final = canvas.copy()
    m3 = mwin[..., None]
    final[y0:, x0:] = win * (1 - m3) + np.clip(res, 0, 255) * m3
    return final

# Janela focada no canto inferior direito (poltrona + contexto do padrão)
y0, x0 = 880, 520

# Variante A: regenera só a extensão (costura de 10px)
maskA = np.zeros((h, W2), np.float32)
maskA[1310:, w-10:] = 1.0
outA = inpaint_window(canvas, maskA, y0, x0)
Image.fromarray(np.uint8(outA)).save('lama/output-a.png')

# Variante B: regenera também uma margem de 40px do original (mais liberdade)
maskB = np.zeros((h, W2), np.float32)
maskB[1310:, w-40:] = 1.0
outB = inpaint_window(canvas, maskB, y0, x0)
Image.fromarray(np.uint8(outB)).save('lama/output-b.png')
print('duas variantes geradas')
