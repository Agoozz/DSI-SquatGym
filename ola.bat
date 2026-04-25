@echo off
REM Creamos una variable para la ruta de un archivo temporal
set "TempHTA=%temp%\boton_magico.hta"

REM Escribimos el codigo de la ventanita paso a paso en el archivo temporal
echo ^<html^> > "%TempHTA%"
echo ^<head^> >> "%TempHTA%"
echo     ^<meta http-equiv="x-ua-compatible" content="ie=edge"^> >> "%TempHTA%"
echo     ^<title^>Boton Magico^</title^> >> "%TempHTA%"
echo     ^<HTA:APPLICATION SCROLL="no" SINGLEINSTANCE="yes" BORDER="dialog" CONTEXTMENU="no" SELECTION="no" /^> >> "%TempHTA%"
echo     ^<script type="text/javascript"^> >> "%TempHTA%"
echo         window.onload = function() { >> "%TempHTA%"
echo             window.resizeTo(450, 350); >> "%TempHTA%"
echo             window.moveTo((screen.availWidth - 450) / 2, (screen.availHeight - 350) / 2); >> "%TempHTA%"
echo         }; >> "%TempHTA%"
echo         function AbrirVideo() { >> "%TempHTA%"
echo             var objShell = new ActiveXObject("WScript.Shell"); >> "%TempHTA%"
echo             objShell.Run("cmd /c start https://youtube.com/shorts/16uJ-jxcKHo?si=_I-jKUELMcT-mkGk", 0, false); >> "%TempHTA%"
echo             window.close(); >> "%TempHTA%"
echo         } >> "%TempHTA%"
echo     ^</script^> >> "%TempHTA%"
echo     ^<style^> >> "%TempHTA%"
echo         body { background-color: #1e1e1e; font-family: 'Segoe UI', sans-serif; text-align: center; margin: 0; } >> "%TempHTA%"
echo         button { padding: 20px 40px; font-size: 24px; font-weight: bold; cursor: pointer; background-color: #ff0000; color: white; border: none; border-radius: 50px; margin-top: 80px; box-shadow: 0 8px 15px rgba(0,0,0,0.5); } >> "%TempHTA%"
echo         h2 { color: white; margin-top: 60px; } >> "%TempHTA%"
echo     ^</style^> >> "%TempHTA%"
echo ^</head^> >> "%TempHTA%"
echo ^<body^> >> "%TempHTA%"
echo     ^<h2^>Listo para ver la sorpresa?^</h2^> >> "%TempHTA%"
echo     ^<button onclick="AbrirVideo()"^>ABRIR SORPRESA^</button^> >> "%TempHTA%"
echo ^</body^> >> "%TempHTA%"
echo ^</html^> >> "%TempHTA%"

REM Ejecutamos el archivo temporal y pausamos el .bat hasta que se cierre la ventana
start /wait mshta "%TempHTA%"

REM Por ultimo, borramos el archivo temporal para no dejar basura
del "%TempHTA%"
