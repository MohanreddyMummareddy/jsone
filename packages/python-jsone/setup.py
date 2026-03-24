#!/usr/bin/env python
"""Setup configuration for jsone Python package."""

from setuptools import setup, find_packages
import os

# Read README
readme_path = os.path.join(os.path.dirname(__file__), "README.md")
long_description = ""
if os.path.exists(readme_path):
    with open(readme_path, "r", encoding="utf-8") as f:
        long_description = f.read()

setup(
    name="jsone",
    version="0.4.0",
    author="Mohan Reddy Mummareddy",
    author_email="mummareddy.contact@gmail.com",
    description="JSON Enhanced - Convert and analyze JSON data as interactive tables",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/MohanreddyMummareddy/jsone",
    project_urls={
        "Bug Tracker": "https://github.com/MohanreddyMummareddy/jsone/issues",
        "Documentation": "https://github.com/MohanreddyMummareddy/jsone/blob/main/README.md",
        "Source Code": "https://github.com/MohanreddyMummareddy/jsone",
    },
    packages=find_packages(),
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Utilities",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
    ],
    keywords="json table csv data conversion analysis",
    license="MIT",
)
