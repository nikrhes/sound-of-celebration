package jkt.business.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;

@SpringBootApplication
@ComponentScan(basePackages= {"jkt"})
@EnableAutoConfiguration
@PropertySources({
	@PropertySource("classpath:application.properties")
})
public class JakRestApplication extends SpringBootServletInitializer {
	
	private static ConfigurableApplicationContext context;

	public static void main(String[] args) {
		
		SpringApplication springApplication = new SpringApplication(JakRestApplication.class);
		//springApplication.addListeners(new ApplicationPidFileWriter("business.hub.pid"));
		context =  springApplication.run(args);
	
	}
	
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(JakRestApplication.class);
	}
}
