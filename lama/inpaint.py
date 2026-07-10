import numpy as np
import torch
from PIL import Image

img = Image.open('lama/input.jpg').convert('RGB')
a = np.asarray(img).astype(np.float32)
h, w, _ = a.shape  # 1786 x 1300
cream = np.array([245, 240, 234], np.float32)

# canvas estendido 150px à direita, preenchido de creme
E = 150
W2 = w + E
canvas = np.tile(cream, (h, W2, 1)).astype(np.float32)
canvas[:, :w] = a

# máscara: faixa direita inteira (com 6px de sobreposição para costura invisível)
mask = np.zeros((h, W2), np.float32)
mask[:, w-6:] = 1.0

# prepara tensores (pad para múltiplo de 8)
def pad8(x):
    ph = (8 - x.shape[-2] % 8) % 8
    pw = (8 - x.shape[-1] % 8) % 8
    return torch.nn.functional.pad(x, (0, pw, 0, ph), mode='reflect')

im_t = torch.from_numpy(canvas.transpose(2, 0, 1) / 255.0).unsqueeze(0).float()
mk_t = torch.from_numpy(mask).unsqueeze(0).unsqueeze(0).float()
H0, W0 = im_t.shape[-2:]
im_t, mk_t = pad8(im_t), pad8(mk_t)
mk_t = (mk_t > 0).float()

model = torch.jit.load('big-lama.pt', map_location='cpu')
model.eval()
with torch.inference_mode():
    out = model(im_t, mk_t)
res = out[0].permute(1, 2, 0).numpy()[:H0, :W0] * 255.0
res = np.clip(res, 0, 255)

# fora da máscara, mantém o original intacto
mk3 = mask[..., None]
final = canvas * (1 - mk3) + res * mk3
Image.fromarray(np.uint8(final)).save('lama/output.png')
print('inpaint concluído', final.shape)
