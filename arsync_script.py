import subprocess
import json
import argparse
def build_folder(root):
    command=f'ardrive upload-file -l "{args.build}" -w {args.wallet} --parent-folder-id {root}'
    result = subprocess.run(command, shell=True, capture_output=True, text=True)

def build_manifest(root):
    command=f'ardrive create-manifest -f {root} -w {args.wallet}'
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    data=json.loads(result.stdout)
    return data["links"][0]
def get_root_folder_id():
    cli_output=get_drive_list()
    try:
        parsed_data = json.loads(cli_output)
        for i in parsed_data:
            if i['path'] == "/test":
                return i['folderId']
    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)

def get_build_file():
    cli_output=get_drive_list()
    try:
        parsed_data = json.loads(cli_output)
        for i in parsed_data:
            if i['name'] == "build":
                return i['folderId']
    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)
def get_drive_list():
    command = f'ardrive list-drive -w {args.wallet} -d {args.drive}'
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.stdout

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Find and display object with a specified name from arweave list-drive output.')
    parser.add_argument('-w', '--wallet', type=str, required=True, help='Wallet address')
    parser.add_argument('-d', '--drive', type=str, required=True, help='drive address')
    # parser.add_argument('-c', '--commit', type=str, required=True, help='commit number')
    parser.add_argument('-b', '--build', type=str, required=True, help='build file root')
    args = parser.parse_args()
    # user creates wallet and a drive with name arsync
    # get_drive_list()

    # getting the folder id of root
    root_folder_id=get_root_folder_id()

    # uploading build file with name build_<commit number>
    build_folder(root_folder_id)

    # getting the uploaded build folder details
    current_build_folder_id=get_build_file()

    # creating a manifest and returning the link
    print(build_manifest(current_build_folder_id))

    



    