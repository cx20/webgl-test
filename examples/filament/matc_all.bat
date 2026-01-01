REM This batch file is a batch file for recompiling Filament material files.

SET EXAMPLES=triangle cube square texture teapot primitive
FOR %%a IN (%EXAMPLES%) DO (
	matc -o %%a\%%a.filamat %%a\%%a.mat
)
