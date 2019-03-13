String[] rawStrings;

void setup(){
  size(800, 600, P3D);
  frameRate(30);
  rawStrings = loadStrings("raw_web_data.txt");
}

void reloadTree(){
  
}

void draw(){
  if(frameCount % 10 == 0){
    reloadTree();
  }
  
}

void drawSeeds(){
  
}
