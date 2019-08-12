float hourlyRate = 30.0f;
float soFar = 0.0f;

void setup(){
  size(220, 100);
   frameRate(1);
   textSize(30);
   
}

void draw(){
  background(50);
  soFar += hourlyRate / 60f / 60f;
  String f = nf(soFar, 0, 2);
  text('$' + f, width/2 - 30, height/2 + 10);
}
