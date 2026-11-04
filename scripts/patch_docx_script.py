with open('scripts/update_report_docx.py', 'r', encoding='utf-8') as f:
    text = f.read()

old_t17 = """t17 = doc.tables[17]
set_cell(t17.rows[1].cells[1], "0");  set_cell(t17.rows[1].cells[2], "0đ")
set_cell(t17.rows[2].cells[1], "0");  set_cell(t17.rows[2].cells[2], "0đ")
set_cell(t17.rows[3].cells[1], "5");  set_cell(t17.rows[3].cells[2], "50.000đ")
set_cell(t17.rows[4].cells[1], "18"); set_cell(t17.rows[4].cells[2], "358.000đ")
set_cell(t17.rows[5].cells[1], "24"); set_cell(t17.rows[5].cells[2], "545.000đ")
set_cell(t17.rows[6].cells[1], "26"); set_cell(t17.rows[6].cells[2], "770.000đ")
set_cell(t17.rows[7].cells[1], "73"); set_cell(t17.rows[7].cells[2], "1.723.000đ")"""

new_t17 = """t17 = doc.tables[17]
set_cell(t17.rows[1].cells[1], "0");  set_cell(t17.rows[1].cells[2], "0đ")
set_cell(t17.rows[2].cells[1], "0");  set_cell(t17.rows[2].cells[2], "0đ")
set_cell(t17.rows[3].cells[1], "5");  set_cell(t17.rows[3].cells[2], "137.000đ")
set_cell(t17.rows[4].cells[1], "17"); set_cell(t17.rows[4].cells[2], "609.000đ")
set_cell(t17.rows[5].cells[1], "21"); set_cell(t17.rows[5].cells[2], "411.000đ")
set_cell(t17.rows[6].cells[1], "30"); set_cell(t17.rows[6].cells[2], "566.000đ")
set_cell(t17.rows[7].cells[1], "73"); set_cell(t17.rows[7].cells[2], "1.723.000đ")"""

text = text.replace(old_t17.replace('\n', '\r\n'), new_t17.replace('\n', '\r\n'))
text = text.replace(old_t17, new_t17)

with open('scripts/update_report_docx.py', 'w', encoding='utf-8') as f:
    f.write(text)
print('update_report_docx.py patched!')
