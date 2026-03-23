# -*- coding: utf-8 -*-
from flask import Flask, send_file, abort
import os

app = Flask(__name__)

FILE_PATH = "/root/visualworld/DataFile/OutDataOptimization.xlsx"


@app.route("/download-input-file", methods=["GET"])
def download_input_file():
    try:
        if not os.path.exists(FILE_PATH):
            abort(404, description="File not found on server.")

        return send_file(
            FILE_PATH,
            as_attachment=True,
            download_name="OutputDataOptimization_completed.xlsx",
        )
    except Exception as e:
        abort(500, description=str(e))


if __name__ == "__main__":
    # ?? NOUVEAU PORT : 5001 (et plus 5055)
    app.run(host="0.0.0.0", port=5001)
