import sys

from PyQt6.QtWidgets import QApplication

from app.view import MainWindow


def main():
    qt_app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(qt_app.exec())


if __name__ == "__main__":
    main()
