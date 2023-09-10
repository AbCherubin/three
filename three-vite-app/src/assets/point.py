import ezdxf
import pandas as pd
from tkinter import Tk
from tkinter.filedialog import askopenfilename

# Define a color map for AutoCAD color indices to RGB values
color_map = {
    0: (0, 0, 0),
    1: (187, 132, 124), #edited
    2: (243, 178, 53), #edited
    3: (0, 255, 0),
    4: (0, 255, 255),
    5: (0, 0, 255),
    6: (255, 0, 255),
    7: (255, 255, 255),
    8: (65, 65, 65),
    9: (128, 128, 128),
    10: (255, 0, 0),
    11: (255, 170, 170),
    12: (189, 0, 0),
    13: (189, 126, 126),
    14: (129, 0, 0),
    15: (129, 86, 86),
    16: (104, 0, 0),
    17: (104, 69, 69),
    18: (79, 0, 0),
    19: (79, 53, 53),
    20: (255, 63, 0),
    21: (255, 191, 170),
    22: (189, 46, 0),
    23: (189, 141, 126),
    24: (129, 31, 0),
    25: (129, 96, 86),
    26: (104, 25, 0),
    27: (104, 78, 69),
    28: (79, 19, 0),
    29: (79, 59, 53),
    30: (255, 127, 0),
    31: (255, 212, 170),
    32: (189, 94, 0),
    33: (189, 157, 126),
    34: (129, 64, 0),
    35: (129, 107, 86),
    36: (104, 52, 0),
    37: (104, 86, 69),
    38: (79, 39, 0),
    39: (79, 66, 53),
    40: (255, 191, 0),
    41: (255, 234, 170),
    42: (189, 141, 0),
    43: (189, 173, 126),
    44: (129, 96, 0),
    45: (129, 118, 86),
    46: (104, 78, 0),
    47: (104, 95, 69),
    48: (79, 59, 0),
    49: (79, 73, 53),
    50: (255, 255, 0),
    51: (255, 255, 170),
    52: (189, 189, 0),
    53: (189, 189, 126),
    54: (129, 129, 0),
    55: (129, 129, 86),
    56: (104, 104, 0),
    57: (104, 104, 69),
    58: (79, 79, 0),
    59: (79, 79, 53),
    60: (191, 255, 0),
    61: (234, 255, 170),
    62: (141, 189, 0),
    63: (173, 189, 126),
    64: (96, 129, 0),
    65: (118, 129, 86),
    66: (78, 104, 0),
    67: (95, 104, 69),
    68: (39, 79, 0),
    69: (66, 79, 53),
    70: (255, 127, 0),
    71: (212, 255, 170),
    72: (94, 189, 0),
    73: (157, 189, 126),
    74: (64, 129, 0),
    75: (107, 129, 86),
    76: (52, 104, 0),
    77: (86, 104, 69),
    78: (39, 79, 0),
    79: (66, 79, 53),
    80: (63, 255, 0),
    81: (191, 255, 170),
    82: (46, 189, 0),
    83: (141, 189, 126),
    84: (31, 129, 0),
    85: (96, 129, 86),
    86: (25, 104, 0),
    87: (78, 104, 69),
    88: (19, 79, 0),
    89: (59, 79, 53),
    90: (0, 255, 0),
    91: (170, 255, 170),
    92: (0, 189, 0),
    93: (126, 189, 126),
    94: (0, 129, 0),
    95: (86, 129, 86),
    96: (0, 104, 0),
    97: (69, 104, 69),
    98: (0, 79, 0),
    99: (53, 79, 53),
    100: (0, 255, 63),
    101: (170, 255, 191),
    102: (0, 189, 46),
    103: (126, 189, 141),
    104: (0, 129, 31),
    105: (86, 129, 96),
    106: (0, 104, 25),
    107: (69, 104, 78),
    108: (0, 79, 19),
    109: (53, 79, 59),
    110: (0, 255, 127),
    111: (170, 255, 212),
    112: (0, 189, 94),
    113: (126, 189, 157),
    114: (0, 129, 64),
    115: (86, 129, 107),
    116: (0, 104, 52),
    117: (69, 104, 86),
    118: (0, 79, 39),
    119: (53, 79, 66),
    120: (0, 255, 191),
    121: (170, 255, 234),
    122: (0, 189, 141),
    123: (126, 189, 173),
    124: (0, 129, 96),
    125: (86, 129, 118),
    126: (0, 104, 78),
    127: (69, 104, 95),
    128: (0, 79, 59),
    129: (53, 79, 73),
    130: (0, 255, 255),
    131: (170, 255, 255),
    132: (0, 189, 189),
    133: (126, 189, 189),
    134: (0, 129, 129),
    135: (86, 129, 129),
    136: (0, 104, 104),
    137: (69, 104, 104),
    138: (0, 79, 79),
    139: (53, 79, 79),
    140: (0, 191, 255),
    141: (170, 234, 255),
    142: (0, 141, 189),
    143: (126, 173, 189),
    144: (0, 96, 129),
    145: (86, 118, 129),
    146: (0, 78, 104),
    147: (69, 95, 104),
    148: (0, 59, 79),
    149: (53, 73, 79),
    150: (0, 255, 255),
    151: (170, 255, 255),
    152: (0, 189, 189),
    153: (126, 189, 189),
    154: (0, 129, 129),
    155: (86, 129, 129),
    156: (0, 104, 104),
    157: (69, 104, 104),
    158: (0, 79, 79),
    159: (53, 79, 79),
    160: (63, 255, 255),
    161: (191, 255, 255),
    162: (46, 189, 189),
    163: (141, 189, 189),
    164: (31, 129, 129),
    165: (96, 129, 129),
    166: (25, 104, 104),
    167: (78, 104, 104),
    168: (19, 79, 79),
    169: (59, 79, 79),
    170: (0, 0, 255),
    171: (170, 170, 255),
    172: (0, 0, 189),
    173: (126, 126, 189),
    174: (0, 0, 129),
    175: (86, 86, 129),
    176: (0, 0, 104),
    177: (69, 69, 104),
    178: (0, 0, 79),
    179: (53, 53, 79),
    180: (0, 63, 255),
    181: (191, 191, 255),
    182: (0, 46, 189),
    183: (141, 141, 189),
    184: (0, 31, 129),
    185: (96, 96, 129),
    186: (0, 25, 104),
    187: (78, 78, 104),
    188: (0, 19, 79),
    189: (59, 59, 79),
    190: (0, 127, 255),
    191: (170, 212, 255),
    192: (0, 94, 189),
    193: (126, 157, 189),
    194: (0, 64, 129),
    195: (107, 107, 129),
    196: (0, 52, 104),
    197: (86, 86, 104),
    198: (0, 39, 79),
    199: (66, 66, 79),
    200: (0, 191, 255),
    201: (170, 234, 255),
    202: (0, 141, 189),
    203: (126, 173, 189),
    204: (0, 96, 129),
    205: (118, 118, 129),
    206: (0, 78, 104),
    207: (95, 95, 104),
    208: (0, 59, 79),
    209: (73, 73, 79),
    210: (255, 0, 0),
    211: (255, 170, 170),
    212: (189, 0, 0),
    213: (189, 126, 126),
    214: (129, 0, 0),
    215: (129, 86, 86),
    216: (104, 0, 0),
    217: (104, 69, 69),
    218: (79, 0, 0),
    219: (79, 53, 53),
    220: (255, 63, 0),
    221: (255, 191, 170),
    222: (189, 46, 0),
    223: (189, 141, 126),
    224: (129, 31, 0),
    225: (129, 96, 86),
    226: (104, 25, 0),
    227: (104, 78, 69),
    228: (79, 19, 0),
    229: (79, 59, 53),
    230: (255, 127, 0),
    231: (255, 212, 170),
    232: (189, 94, 0),
    233: (189, 157, 126),
    234: (129, 64, 0),
    235: (129, 107, 86),
    236: (104, 52, 0),
    237: (104, 86, 69),
    238: (79, 39, 0),
    239: (79, 66, 53),
    240: (255, 191, 0),
    241: (255, 234, 170),
    242: (189, 141, 0),
    243: (189, 173, 126),
    244: (129, 96, 0),
    245: (129, 118, 86),
    246: (104, 78, 0),
    247: (104, 95, 69),
    248: (79, 59, 0),
    249: (79, 73, 53),
    250: (255, 0, 255),
    251: (255, 170, 255),
    252: (189, 0, 189),
    253: (189, 126, 189),
    254: (129, 0, 129),
    255: (86, 86, 86),
}

def color_to_hex(color_index):
    # Convert an AutoCAD color index to a hexadecimal color code
    if color_index in color_map:
        color = color_map[color_index]
        return "#{:02x}{:02x}{:02x}".format(color[0], color[1], color[2])
    else:
        return None

def extract_lwpolyline_properties(dxf_file):
    doc = ezdxf.readfile(dxf_file)
    msp = doc.modelspace()

    data = []
    num_polylines = 0  # Initialize a counter for polylines
    num_lines = 0  # Initialize a counter for lines

    for entity in msp:
        if entity.dxftype() == 'LWPOLYLINE':
            num_polylines += 1  # Increment the polyline counter
            points = entity.get_points('xyb')
            is_closed = entity.closed  # Check if the polyline is closed
            for index, point in enumerate(points):
                if entity.dxf.layer.startswith('-'):
                    color_index = entity.dxf.color if entity.dxf.color != 256 else doc.layers.get(entity.dxf.layer).color  # Use layer color if color is set to ByLayer
                    color_code = color_to_hex(color_index)  # Convert color to hex format
                    data.append({
                        'Layer': entity.dxf.layer,
                        'Polyline_ID': entity.dxf.handle,
                        'Point_Index': index,
                        'X': point[0],
                        'Y': point[1],
                        'Color': color_code,
                    })

            # If the polyline is closed, add an extra point equal to the first point
            if is_closed and entity.dxf.layer.startswith('-'):
                color_index = entity.dxf.color if entity.dxf.color != 256 else doc.layers.get(entity.dxf.layer).color  # Use layer color if color is set to ByLayer
                color_code = color_to_hex(color_index)  # Convert color to hex format
                first_point = points[0]
                data.append({
                    'Layer': entity.dxf.layer,
                    'Polyline_ID': entity.dxf.handle,
                    'Point_Index': len(points),  # Index for the extra point
                    'X': first_point[0],
                    'Y': first_point[1],
                    'Color': color_code,
                })
        elif entity.dxftype() == 'LINE':
            num_lines += 1  # Increment the line counter
            start_point = (entity.dxf.start.x, entity.dxf.start.y)
            end_point = (entity.dxf.end.x, entity.dxf.end.y)
            if entity.dxf.layer.startswith('-'):
                color_index = entity.dxf.color if entity.dxf.color != 256 else doc.layers.get(entity.dxf.layer).color  # Use layer color if color is set to ByLayer
                color_code = color_to_hex(color_index)  # Convert color to hex format
                data.append({
                    'Layer': entity.dxf.layer,
                    'Polyline_ID': entity.dxf.handle,
                    'Point_Index': 0,  # Start point
                    'X': start_point[0],
                    'Y': start_point[1],
                    'Color': color_code,
                })
                data.append({
                    'Layer': entity.dxf.layer,
                    'Polyline_ID': entity.dxf.handle,
                    'Point_Index': 1,  # End point
                    'X': end_point[0],
                    'Y': end_point[1],
                    'Color': color_code,
                })

    return data, num_polylines, num_lines

def main():
    Tk().withdraw()  # this will hide the main tkinter window
    filename = askopenfilename()  # this will open a file dialogue

    data, num_polylines, num_lines = extract_lwpolyline_properties(filename)

    df = pd.DataFrame(data)
    csv_file = 'cubes.csv'  # Change the filename here
    df.to_csv(csv_file, index=False)

    # Print both the input file path and the save path
    print(f"Input file: {filename}")
    print(f"Saved CSV file: {csv_file}")
    print(f"Total polylines extracted: {num_polylines}")
    print(f"Total lines extracted: {num_lines}")

if __name__ == "__main__":
    main()
