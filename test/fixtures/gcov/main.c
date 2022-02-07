#include <stdio.h>

void numbers(int num)
{
    if (num == 1) {
        printf("Number is 1\n");
    } else if (num == 2){
        printf("Number is 2\n");
    } else {
        printf("Number is %d\n", num);
    }
}


int main(void)
{
    numbers(1);
    numbers(2);
    return 0;
}
