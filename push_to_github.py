"""
Direct GitHub Uploader for Smart Bus Route Management System
Repository: https://github.com/bharathwaj221108-jpg/project-1.git
"""

import os
import sys
import base64
import json
import urllib.request
import urllib.error

REPO_OWNER = "bharathwaj221108-jpg"
REPO_NAME = "project-1"
BRANCH = "main"
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

IGNORE_LIST = [
    "__pycache__",
    ".git",
    "push_to_github.py",
]

def get_files_to_upload():
    upload_files = []
    for root, dirs, files in os.walk(PROJECT_DIR):
        # Filter out ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_LIST]
        for f in files:
            if f.endswith('.pyc') or f in IGNORE_LIST:
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, PROJECT_DIR).replace('\\', '/')
            upload_files.append((rel_path, full_path))
    return upload_files

def github_api_request(url, method="GET", token=None, data=None):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Smart-Bus-Route-Uploader",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            return json.loads(res_body) if res_body else {}, response.status
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        try:
            return json.loads(err_msg), e.code
        except Exception:
            return {"message": err_msg}, e.code

def upload_file(rel_path, full_path, token):
    with open(full_path, 'rb') as f:
        content_bytes = f.read()
    
    content_b64 = base64.b64encode(content_bytes).decode('utf-8')
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{rel_path}"
    
    # Check if file exists to retrieve SHA
    existing_file, status = github_api_request(f"{url}?ref={BRANCH}", "GET", token)
    sha = existing_file.get("sha") if status == 200 else None

    payload = {
        "message": f"feat: add {rel_path} for Smart Bus Route Management System",
        "content": content_b64,
        "branch": BRANCH
    }
    if sha:
        payload["sha"] = sha

    res, put_status = github_api_request(url, "PUT", token, payload)
    if put_status in [200, 201]:
        print(f"  [+] Uploaded: {rel_path}")
        return True
    else:
        print(f"  [-] Failed ({put_status}): {rel_path} -> {res.get('message', 'Unknown error')}")
        return False

def main():
    print("=" * 65)
    print("  GITHUB UPLOADER: Smart Bus Route Management System")
    print(f"  Target: https://github.com/{REPO_OWNER}/{REPO_NAME}")
    print("=" * 65)

    token = os.environ.get("GITHUB_TOKEN")
    if not token and len(sys.argv) > 1:
        token = sys.argv[1].strip()

    if not token:
        print("\nPlease provide your GitHub Personal Access Token (PAT).")
        print("To create one:")
        print("  1. Go to: https://github.com/settings/tokens")
        print("  2. Generate new token (classic) -> select 'repo' scope.")
        print("  3. Paste the token below:")
        try:
            token = input("\nEnter GitHub Token: ").strip()
        except KeyboardInterrupt:
            print("\nAborted.")
            return

    if not token:
        print("Error: No GitHub token provided.")
        return

    # Check repository accessibility
    repo_info, status = github_api_request(f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}", "GET", token)
    if status != 200:
        print(f"\nError accessing repository ({status}): {repo_info.get('message')}")
        print("Please ensure your token has 'repo' permissions for this repository.")
        return

    print(f"\nRepository verified: {repo_info.get('full_name')} (Default branch: {repo_info.get('default_branch', BRANCH)})")
    
    files = get_files_to_upload()
    print(f"Found {len(files)} files to upload to GitHub...\n")

    success_count = 0
    for rel_path, full_path in files:
        if upload_file(rel_path, full_path, token):
            success_count += 1

    print("\n" + "=" * 65)
    print(f"  Upload Complete! {success_count}/{len(files)} files uploaded successfully.")
    print(f"  View repository: https://github.com/{REPO_OWNER}/{REPO_NAME}")
    print("=" * 65)

if __name__ == "__main__":
    main()
