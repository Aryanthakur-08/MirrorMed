import subprocess
import sys
import os
import time

def start_backend():
    print("Starting Backend...")
    # Using 'python -m uvicorn main:app' instead of relying on activate.bat for better cross-platform compatibility
    # Assuming 'python' is in PATH and the user has installed requirements globally or in their default environment.
    # If a venv exists, we try to use its python executable directly.
    # We are using cwd="backend", so the path to the virtual environment python should be relative to the backend directory.
    venv_python_relative = os.path.join("venv", "Scripts", "python.exe")
    venv_python_absolute = os.path.join(os.getcwd(), "backend", "venv", "Scripts", "python.exe")
    
    python_exec = venv_python_absolute if os.path.exists(venv_python_absolute) else "python"
    
    return subprocess.Popen(
        [python_exec, "main.py"],
        cwd="backend",
        stdout=sys.stdout,
        stderr=sys.stderr
    )

def start_frontend():
    print("Starting Frontend...")
    # 'npm.cmd' is usually required on Windows when using subprocess
    npm_exec = "npm.cmd" if os.name == 'nt' else "npm"
    
    return subprocess.Popen(
        [npm_exec, "run", "dev"],
        cwd="frontend",
        stdout=sys.stdout,
        stderr=sys.stderr
    )

if __name__ == "__main__":
    print("================================")
    print("Starting MirrorMed Servers")
    print("================================")
    
    backend_proc = start_backend()
    frontend_proc = start_frontend()
    
    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("Backend exited unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend exited unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nShutting down servers...")
    finally:
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Servers stopped.")
