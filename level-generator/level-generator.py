from __future__ import division, print_function
import numpy as np
from noise import pnoise2
import matplotlib.pyplot as plt
from skimage.morphology import remove_small_objects
from scipy.ndimage.morphology import binary_dilation
from PIL import Image
import json

width = 3000
height = 1000
octaves = 4
freq = 128.0 * octaves

y = np.arange(height)
# ground
boundaries = np.exp(-y/(0.25*height))
# sky islands
intermediate = (y/height)**2.

y_profile = boundaries + intermediate
y_profile -= np.amin(y_profile)
y_profile /= np.amax(y_profile)
y_profile[y_profile < 0.33] = 0.33
y_profile = y_profile[::-1]

for base in range(100):
    print('base: {}'.format(base))
    texture = np.empty((height, width))
    for y in range(height):
        for x in range(width):
            texture[y, x] = pnoise2(x / freq, y / freq, octaves, persistence=1, base=base)

    texture -= np.amin(texture)
    texture /= np.amax(texture)

    terrain = ~(texture > y_profile[:, None])
    remove_small_objects(terrain, 5000, in_place=True)

    overlays = [~(texture > y_profile[:, None]/a) for a in np.linspace(1.2, 2.5, 4)]
    for i in range(len(overlays)):
        remove_small_objects(overlays[i], 5000, in_place=True)

    cloud_mask = ~binary_dilation(terrain, iterations=32*5)
    cloud_mask[:, :32*5] = False
    cloud_mask[:, -32*5:] = False

    easy_stars_mask = ~binary_dilation(terrain, iterations=64*5)
    easy_stars_mask[:, :128*5] = False
    easy_stars_mask[:, -128*5:] = False

    tricky_stars_mask = binary_dilation(terrain, iterations=48*5)*(~binary_dilation(terrain, iterations=32*5))
    tricky_stars_mask[:, :64*5] = False
    tricky_stars_mask[:, -64*5:] = False

    # plt.figure(dpi=72*3)
    # plt.imshow(terrain.astype(np.uint8) + overlay.astype(np.uint8), cmap='rainbow', vmin=0, vmax=2)
    # plt.imshow(cloud_mask)
    # plt.imshow(easy_stars_mask)
    # plt.imshow(tricky_stars_mask)
    # plt.imshow(zoom(terrain, 10, order=0).astype(np.uint8) + zoom(overlay, 10, order=0).astype(np.uint8),
    #            cmap='rainbow', vmin=0, vmax=2)
    # plt.show()

    terrain_rgba = np.zeros([terrain.shape[0], terrain.shape[1], 4], dtype=np.uint8)
    terrain_rgba[terrain] = np.array([255, 213, 78, 255])

    colors = [np.array([251, 146, 100, 255]),
              np.array([251, 107, 103, 255]),
              np.array([246, 83, 101, 255]),
              np.array([221, 74, 101, 255])]

    for overlay, color in zip(overlays, colors):
        terrain_rgba[overlay] = color

    img = Image.fromarray(terrain_rgba)
    img.save('../pendulum/assets/levels/terrain{}.png'.format(base))

    startcloud_x = [i for i, m in enumerate(cloud_mask.T) if np.any(m)][0]
    startcloud_y = [i for i, m in enumerate(cloud_mask.T[startcloud_x]) if m][-1]

    finishcloud_x = [i for i, m in enumerate(cloud_mask.T) if np.any(m)][-1]
    finishcloud_y = [i for i, m in enumerate(cloud_mask.T[finishcloud_x]) if m][-1]

    positions = {'start': [startcloud_x, startcloud_y], 'finish': [finishcloud_x, finishcloud_y]}
    with open('../pendulum/assets/levels/positions{}.json'.format(base), 'w') as outfile:
        json.dump(positions, outfile)
