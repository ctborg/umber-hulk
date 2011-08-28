// If there are stars or a planet:
// Generate an x-digit code from x,y
// If first digit is 1: planet
// If stars, second digit is how many
// If stars, following digits are x,y coordinates within hex (with multiplier)
// If planet, digits describe look of planet, defence and resources
// Math.log(9999) tops out at 9 (9.2...)
//

/*
D='b=a.random;D=a.cos;d=document.body.children.c;f=d.getContext("2d");_=255#g=194;Ah=388;@w=(v=f[C="geJ0,0,h,Sr<40;r+=2)@f[Z="puJv,0,s=0),f.draw$(d,h-h*r,(g-g*r)*b(L=a.asin),h*r,g*r),eOh,(Ss<3e5;T=a.abs){w[s+=4]=(m=r?w[s]+(e[s+1]-127)*r/g:U+(w[s+1]=b(i=U)*(w[s+3]=_))X)H};e=(vOAg,SsetInterval("s=U+U*D(Q+=.05)|0;@y=g,I=0;y--;)@x=g;x--;){z=x-i;G=y-i;q=.5+D(Q/.7)/2;l=(z*z+G*G+1)/1e3*(1+9*q);m=w[r=(y*h+x+s)*4]/5-9;n=o=p=mH+w[r]*(w[r+1]<1);if(l<6){k=3.6/l*L(l/6);G*=q=1+q*3;z*=q;W=w[4*(s+(GY*h+zY];P=W<75?1:W>85?0:9-W/9;m=4-WX;m=m>1?1:mH;F=1-k*k*zX;n=((U+5~g+8N6Ko=((U+4~g+7N9Kp=((46+3~U+N10K}k=6/l*L(l/7);j=w[((i-G*k|0)*h+g-z*k+i-s/2|0)*4];M=1-T(6-l);n^o^p^M*=M>0;oV;pVE<n?_:nE<o?_:oE<p?_:pE}f[Z](v,0,0)",9);d=d.style#Ah+"px"';
for(Q=r=U=0; ++U<97; a=Math){
	D=D.replace("~JSONEKAY^#@H$XV"[j=U%16],'0*T(W/9-6))*m+(1-m)*((3t$Data"](3g)).data;3=f[C](0,0,30*(WX-2))*P+(1-P)*3;e[I++]=_3*(2+W/15)))*(F<.1?.1:F>.8?.8:F);3d.width=3*k+i|0)3+=g*(j>U?0:1-j/U)*(l<7)*(l>6?M:1)||0;3;d.height=3for(3<0?0:m3Image3/253+=M*29'.split(3)[j]);
}
alert(D);

 */


// Planet code based on http://blog.nihilogic.dk/2010/09/planet-1024-my-js1k-entry.html by Jacob Seidelin
// worked nicely, but waaay to slow for this game
function planet() {
	var Q = 0;
	var r = 0;
	var U = 50;
    var d = $('<canvas class="planet" width="100" height="100"></canvas>')[0];
    document.body.appendChild(d);
    var f = d.getContext("2d");
    var _ = 255;
    d.height = g = 100;
    d.width = h = 100;
    for (w = (v = f[C = "getImageData"](0, 0, h, g)).data; r < 40; r += 2){
        for (f[Z = "putImageData"](v, 0, s = 0), f.drawImage(d, h - h * r, (g - g * r) * Math.random(L = Math.asin), h * r, g * r), e = f[C](0, 0, h, (g)).data; s < 3e5; T = Math.abs) {
            w[s += 4] = (m = r ? w[s] + (e[s + 1] - 127) * r / g : U + (w[s + 1] = Math.random(i = U) * (w[s + 3] = _)) / 25) < 0 ? 0 : m;
        }
    }
    var e = (v = f[C](0, 0, d.width = g, g)).data;
	s=U+U * Math.cos(Q+=.05)|0;
	for(y=g,I=0;y--;){
		for(x=g;x--;){
			z=x-i;
			G=y-i;
			q = .5 + Math.cos(Q/.7) / 2;
			l=(z*z+G*G+1)/1e3*(1+9*q);
			m=w[r=(y*h+x+s)*4]/5-9;
			n=o=p=m<0?0:m+w[r]*(w[r+1]<1);
			if(l<6){
				k=3.6/l*L(l/6);
				G*=q=1+q*3;
				z*=q;
				W=w[4*(s+(G*k+i|0)*h+z*k+i|0)];
				P=W<75 ? 1 : W>85 ? 0 : 9-W/9;
				m=4-W/25;
				m = m>1 ? 1 : m < 0 ? 0 : m;
				F=1-k*k*z/25;
				n=((U+50*T(W/9-6))*m+(1-m)*((g+80*(W/25-2))*P+(1-P)*6*(2+W/15)))*(F<.1?.1:F>.8?.8:F);
				o=((U+40*T(W/9-6))*m+(1-m)*((g+70*(W/25-2))*P+(1-P)*9*(2+W/15)))*(F<.1?.1:F>.8?.8:F);
				p=((46+30*T(W/9-6))*m+(1-m)*((U+0*(W/25-2))*P+(1-P)*10*(2+W/15)))*(F<.1?.1:F>.8?.8:F);
			}
			k=6/l*L(l/7);
			j=w[((i-G*k|0)*h+g-z*k+i-s/2|0)*4];
			M=1-T(6-l);
			n+=g*(j>U?0:1-j/U)*(l<7)*(l>6?M:1)||0;
			o+=g*(j>U?0:1-j/U)*(l<7)*(l>6?M:1)||0;
			p+=g*(j>U?0:1-j/U)*(l<7)*(l>6?M:1)||0;
			M*=M>0;
			o+=M*29;
			p+=M*29;
			e[I++]=_<n?_:n;
			e[I++]=_<o?_:o;
			e[I++]=_<p?_:p;
			e[I++]=_
		}
		f[Z](v,0,0)
	}
    return d;
}
