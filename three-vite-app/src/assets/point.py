import ezdxf
import pandas as pd
import os
from tkinter import Tk
from tkinter.filedialog import askopenfilename

def extract_lwpolyline_properties(dxf_file):
    doc = ezdxf.readfile(dxf_file)
    msp = doc.modelspace()

    data = []
    for entity in msp:
        if entity.dxftype() == 'LWPOLYLINE':
            points = entity.get_points('xyb')
            is_closed = entity.closed  # Check if the polyline is closed
            for index, point in enumerate(points):
                if entity.dxf.layer.startswith('-'):
                    data.append({
                        'Layer': entity.dxf.layer,
                        'Polyline ID': entity.dxf.handle,
                        'Point Index': index,
                        'X': point[0],
                        'Y': point[1],
                    })

            # If the polyline is closed, add an extra point equal to the first point
            if is_closed and entity.dxf.layer.startswith('-'):
                first_point = points[0]
                data.append({
                    'Layer': entity.dxf.layer,
                    'Polyline ID': entity.dxf.handle,
                    'Point Index': len(points),  # Index for the extra point
                    'X': first_point[0],
                    'Y': first_point[1],
                })
        elif entity.dxftype() == 'LINE':
            start_point = (entity.dxf.start.x, entity.dxf.start.y)
            end_point = (entity.dxf.end.x, entity.dxf.end.y)
            if entity.dxf.layer.startswith('-'):
                data.append({
                    'Layer': entity.dxf.layer,
                    'Polyline ID': entity.dxf.handle,
                    'Point Index': 0,  # Start point
                    'X': start_point[0],
                    'Y': start_point[1],
                })
                data.append({
                    'Layer': entity.dxf.layer,
                    'Polyline ID': entity.dxf.handle,
                    'Point Index': 1,  # End point
                    'X': end_point[0],
                    'Y': end_point[1],
                })

    return data

def main():
    Tk().withdraw()  # this will hide the main tkinter window
    filename = askopenfilename()  # this will open a file dialogue

    data = extract_lwpolyline_properties(filename)

    df = pd.DataFrame(data)
    csv_file = os.path.splitext(filename)[0] + '.csv'
    df.to_csv(csv_file, index=False)

if __name__ == "__main__":
    main()

