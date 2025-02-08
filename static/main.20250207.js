function getNum(str, firstStr, secondStr) {
    if (str == "" || str == null || str == undefined) {
        return "";
    }
    if (str.indexOf(firstStr) < 0) {
        return "";
    }
    var subFirstStr = str.substring(str.indexOf(firstStr) + firstStr.length, str.length);
    var subSecondStr = subFirstStr.substring(0, subFirstStr.indexOf(secondStr));
    return subSecondStr;
}

function msg(type, text) {
    document.getElementById(type + 'info').innerHTML = text;
    var ele = '#' + type;
    var elem = $(ele);
    if (elem.css('display') != 'none') return;
    elem.fadeIn(100);
    setTimeout(function() {
        elem.fadeOut(100);
    }, 2000);
}

function convertBytes(byteSize) {
    byteSize = Number(byteSize);
    if (byteSize < 0) {
        throw new Error("Byte size cannot be negative");
    }

    const units = ["B", "KB", "MB", "GB", "TB"];
    let index = 0;

    while (byteSize >= 1024 && index < units.length - 1) {
        byteSize /= 1024;
        index++;
    }

    return `${byteSize.toFixed(2)} ${units[index]}`;
}

function openDir(path) {
    const dir = encodeURIComponent(path);
    const apiUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}api/list?dir=${dir}`;
    document.getElementById("loadinginfo").innerHTML = '获取文件列表中';
    $('#loading').fadeIn(100);
    var data = {
        'path': path
    }
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                $('#loading').fadeOut(100);
             	msg('warn', '获取失败');
                throw new Error('网络响应异常');
            }
            return response.json();
        })
        .then(jsonData => {
            $('#loading').fadeOut(100);
            const pathParts = path.split('/').filter(part => part);
            const tablabDiv = document.getElementById('tablab');
            tablabDiv.innerHTML = `
                <li class="number" aria-current="true" aria-label="page 1" tabindex="0"><a href="javascript:openDir('%2F');" role="button" class="el-tabs__item is-top is-active" title="全部文件">全部文件</a></li>
            `;

            pathParts.forEach((part, index) => {
                const currentPath = '/' + pathParts.slice(0, index + 1).join('/');
                const displayPart = part.length > 7 ? part.substring(0, 7) + '...' : part;
                const html = `
                    <li class="number" aria-current="true" aria-label="page 1" tabindex="0"><a href="javascript:openDir('${encodeURIComponent(currentPath)}');" role="button" class="el-tabs__item is-top is-active" title="${part}">${displayPart}</a></li>
                `;
                tablabDiv.innerHTML += html;
            });
            const fileListDiv = document.getElementById('filelist');
            fileListDiv.innerHTML = '';
            const fileListinfo = document.getElementById('fileinfo');
            fileListinfo.innerHTML = '';
            if (jsonData.code !== 200 || !jsonData.data || !jsonData.data.list) {
             	msg('warn', '获取失败');
                throw new Error('无效的响应数据');
            }

            jsonData.data.list.forEach((item, index) => {
                const folderName = item.server_filename;
                const folderPath = item.path;
                const creationTime = new Date(item.local_ctime * 1000).toLocaleString();
                let fileSize = item.size;
                let fileSizeFomat = convertBytes(fileSize);
                const fileCate = item.category;
                const fsid = item.fs_id;
                let fileCateText = "其他";

                switch (fileCate) {
                    case 1:
                        fileCateText = '视频';
                        break;
                    case 2:
                        fileCateText = '音乐';
                        break;
                    case 3:
                        fileCateText = '图片';
                        break;
                    case 4:
                        fileCateText = '文档';
                        break;
                    case 5:
                        fileCateText = '应用';
                        break;
                    case 6:
                        fileCateText = '其他';
                        break;
                    case 7:
                        fileCateText = '种子';
                        break;
                    default:
                        fileCateText = '未知类型';
                        break;
                }
                let clickCommend = `javascript:openMeue('${index + 1}');`;
                const isDir = item.isdir;
                let MenuText = "菜单";
                if (isDir === 1) {
                    fileSizeFomat = "---";
                    fileCateText = "文件夹";
                    clickCommend = `javascript:openDir('${encodeURIComponent(folderPath)}');`;
                    MenuText = "文件夹";
                }

                const html = `
                    <tr class="el-table__row">
                        <td colspan="1" rowspan="1" class="el-table__cell" style="left: 0px;">
                            <div class="cell">${folderName}</div>
                        </td>
                        <td colspan="1" rowspan="1" class="el-table__cell">
                            <div class="cell">${fileCateText}</div>
                        </td>
                        <td colspan="1" rowspan="1" class="el-table__cell">
                            <div class="cell">${fileSizeFomat}</div>
                        </td>
                        <td colspan="1" rowspan="1" class="el-table__cell">
                            <div class="cell">${creationTime}</div>
                        </td>
                        <td colspan="1" rowspan="1" class="el-table-fixed-column--right is-first-column el-table__cell" style="left: 0px;">
                            <div class="cell">
                                <a aria-labelledby="js_p1m1_bd" href="${clickCommend}" class="el-button el-button--primary el-button--small is-link">打开${MenuText}</a>
                            </div>
                        </td>
                    </tr> 
                `;
                const info = `
                <div id="Info_${index + 1}" hidden>
                        <div id="File_Type_${index + 1}" value="${fileCate}"></div>
                        <div id="File_Path_${index + 1}" value="${folderPath}"></div>
                        <div id="File_Fsid_${index + 1}" value="${fsid}"></div>
                        <div id="File_Size_${index + 1}" value="${fileSize}"></div>
                        <div id="File_Filename_${index + 1}" value="${folderName}"></div>
                </div>  
                `

                fileListDiv.innerHTML += html;
                fileListinfo.innerHTML += info;
            });
        })
        .catch(error => {
            $('#loading').fadeOut(100);
            msg('warn', '获取失败');
            console.error('获取数据时出错:', error);
        });
}


function openMeue(num) {
    var ft = document.getElementById('File_Type_' + num).getAttribute('value');
    if (ft == '1' || ft == '2' || ft == '3') {
        if (ft == '1') {
            document.getElementById("potplayer").style = 'display';
        } else {
            document.getElementById("potplayer").style = 'display: none';
        }
        document.getElementById("player").style = 'display';
    } else if ($('#player').css('display') != 'none') {
        document.getElementById("player").style = 'display: none';
        document.getElementById("potplayer").style = 'display: none';
    }
    document.getElementById('meueid').setAttribute('value', num);
    $('#meue').fadeIn(100);
}

function getDlink(type) {
   document.getElementById("loadinginfo").innerHTML = '获取下载地址中';
    $('#loading').fadeIn(100);
    var num = document.getElementById('meueid').getAttribute('value');
    var fid = document.getElementById('File_Fsid_' + num).getAttribute('value');
    var fname = document.getElementById('File_Filename_' + num).getAttribute('value');
    var dlink = window.location.protocol + "//" + window.location.host + window.location.pathname + "api/down?fid=" + fid + '&m=.baidu.com';
    if (type == 'download') {
        window.open(dlink);
        msg('ok', '获取下载地址成功');
    } else if (type == 'aria2c' || type == 'mo') {
        if (type == 'mo') {
            var port = 16800;
            Aria2DownLoad(fname, dlink, 'netdisk', 32, port);
        } else {
            var port = 6800;
            Aria2DownLoad(fname, dlink, 'netdisk', 16, port);
        }
    } else if (type == 'pot') {
        window.open('potplayer://' + dlink);
        msg('ok', '获取下载地址成功');
    } else if(type == 'play'){
        msg('ok', '获取下载地址成功');
        $('#loading').fadeOut(100);
        return dlink;
    } else {
        var aux = document.createElement("input");
        aux.setAttribute("value", dlink);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
        msg('ok', '已复制到粘贴板');
    }
    $('#loading').fadeOut(100);
}

function player() {
    var num = document.getElementById('meueid').getAttribute('value');
   var fid = document.getElementById('File_Fsid_' + num).getAttribute('value');
   var ft = document.getElementById('File_Type_' + num).getAttribute('value');
    var url = getDlink('play');
    msg('loading', '预览准备中...');
    if (ft == 3) {
        document.getElementById('playerinfo').innerHTML = '<div class="el-image-viewer__mask"><div class="el-image-viewer__canvas"><img src="'+url+'" class="el-image-viewer__img" style="transform: scale(1) rotate(0deg) translate(0px, 0px); max-height: 100%; max-width: 100%;"></div></div>';
        $('#meue').fadeOut(100);
        $('#gallery').fadeIn(100)
    } else if (ft == 1 || ft ==2) {
        dplayer(url);
        $('#meue').fadeOut(100);
        $('#gallery').fadeIn(100);
    } else {
        msg('error', '不支持的预览格式');
    }
}

function dplayer(url) {
    var type = 'normal';
    const dp = new DPlayer({
        container: document.getElementById('playerinfo'),
        autoplay: true,
        video: {
            url: url,
            type: type,
            hotkey: true,
        }
    });
}

function closeplayer() {
    $('#gallery').fadeOut(100);
    document.getElementById('playerinfo').innerText = 'null';
}

document.addEventListener('DOMContentLoaded', function() {
    openDir('/');
});