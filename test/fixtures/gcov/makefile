CC	= gcc
CFLAG = -fPIC -fprofile-arcs -ftest-coverage
RM	= rm -rf

main : main.o
	$(CC) $(CFLAG) -o main main.o

main.o : main.c
	$(CC) $(CFLAG) -c -Wall -Werror main.c

clean:
	$(RM) main *.o *.so *.gcno *.gcda *.gcov
