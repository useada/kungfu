import csv
import os
from contextlib import contextmanager
from pykungfu import longfist as lf
from pykungfu import yijinjing as yjj


class CsvSink(yjj.sink):
    def __init__(self, ctx, tagged_types):
        yjj.sink.__init__(self)
        self.ctx = ctx
        self.tagged_types = tagged_types
        self.files = {}
        self.writers = {}

    def put(self, location, dest_id, frame):
        if frame.msg_type not in self.tagged_types:
            return
        data_type = self.tagged_types[frame.msg_type]
        header = [m for m in vars(data_type) if not m.startswith('_')]
        output = os.path.join(self.ctx.inbox_dir, f'{data_type.__name__}.csv')
        if output not in self.writers:
            self.files[output] = open(output, 'w', newline='')
            self.writers[output] = csv.writer(self.files[output])
            self.writers[output].writerow(header)
        data = getattr(frame, data_type.__name__)()
        self.writers[output].writerow([extract(data, m) for m in header])

    def close(self):
        [file.close() for file in self.files.values()]


def extract(data, m):
    result = getattr(data, m)
    result_type = type(result)
    if result_type.__module__ == lf.enums.__name__ or result_type.__module__ == yjj.__name__:
        return int(result)
    if result_type == str:
        return '"' + result.replace('"', '\\"') + '"'
    return result


@contextmanager
def open_csv_sink(ctx, tagged_types):
    sink = CsvSink(ctx, tagged_types)
    try:
        yield sink
    finally:
        sink.close()
